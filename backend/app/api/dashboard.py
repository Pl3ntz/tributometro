from collections import defaultdict
from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.tax_breakdown import TaxBreakdown
from app.models.transaction import Transaction
from app.schemas.transaction import DashboardSummary, MonthlyData, TaxTypeBreakdown

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
):
    """Get current month dashboard summary."""
    now = datetime.now()
    start = date(now.year, now.month, 1)
    if now.month == 12:
        end = date(now.year + 1, 1, 1)
    else:
        end = date(now.year, now.month + 1, 1)

    stmt = (
        select(Transaction)
        .options(selectinload(Transaction.tax_breakdowns))
        .where(Transaction.date >= start, Transaction.date < end)
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    total_spent = sum(float(t.amount) for t in transactions)
    total_taxes = 0.0
    breakdown_by_type: dict[str, float] = defaultdict(float)
    breakdown_by_category: dict[str, dict[str, float]] = defaultdict(
        lambda: {"total_spent": 0.0, "taxes": 0.0}
    )
    precision = {"high": 0, "medium": 0, "estimated": 0}

    for txn in transactions:
        txn_taxes = sum(float(tb.amount) for tb in txn.tax_breakdowns)
        total_taxes += txn_taxes

        for tb in txn.tax_breakdowns:
            breakdown_by_type[tb.tax_type] += float(tb.amount)

        cat = txn.category or "outros"
        breakdown_by_category[cat]["total_spent"] += float(txn.amount)
        breakdown_by_category[cat]["taxes"] += txn_taxes

        conf = txn.confidence or 0
        if conf >= 0.90:
            precision["high"] += 1
        elif conf >= 0.60:
            precision["medium"] += 1
        else:
            precision["estimated"] += 1

    effective_rate = total_taxes / total_spent if total_spent > 0 else 0.0

    # Generate top insight
    top_insight = _generate_insight(breakdown_by_type, breakdown_by_category, total_taxes)

    # Round values
    breakdown_by_type_rounded = {k: round(v, 2) for k, v in breakdown_by_type.items()}
    breakdown_by_category_rounded = {
        k: {"total_spent": round(v["total_spent"], 2), "taxes": round(v["taxes"], 2)}
        for k, v in breakdown_by_category.items()
    }

    return DashboardSummary(
        period=f"{now.year}-{now.month:02d}",
        total_spent=round(total_spent, 2),
        total_taxes=round(total_taxes, 2),
        effective_tax_rate=round(effective_rate, 4),
        breakdown_by_type=breakdown_by_type_rounded,
        breakdown_by_category=breakdown_by_category_rounded,
        precision_summary=precision,
        top_insight=top_insight,
    )


@router.get("/monthly", response_model=list[MonthlyData])
async def get_monthly(
    db: AsyncSession = Depends(get_db),
):
    """Get last 12 months history."""
    stmt = (
        select(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.sum(Transaction.amount).label("total_spent"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(12)
    )

    result = await db.execute(stmt)
    rows = result.all()

    monthly = []
    for row in rows:
        year, month, spent = int(row.year), int(row.month), float(row.total_spent)

        tax_stmt = (
            select(func.sum(TaxBreakdown.amount))
            .join(Transaction)
            .where(
                extract("year", Transaction.date) == year,
                extract("month", Transaction.date) == month,
            )
        )
        tax_result = await db.execute(tax_stmt)
        total_tax = float(tax_result.scalar() or 0)

        monthly.append(MonthlyData(
            month=f"{year}-{month:02d}",
            total_spent=round(spent, 2),
            total_taxes=round(total_tax, 2),
        ))

    return monthly


@router.get("/by-tax", response_model=list[TaxTypeBreakdown])
async def get_by_tax(
    db: AsyncSession = Depends(get_db),
):
    """Get breakdown by tax type for current month."""
    now = datetime.now()
    start = date(now.year, now.month, 1)
    if now.month == 12:
        end = date(now.year + 1, 1, 1)
    else:
        end = date(now.year, now.month + 1, 1)

    stmt = (
        select(
            TaxBreakdown.tax_type,
            func.sum(TaxBreakdown.amount).label("total"),
        )
        .join(Transaction)
        .where(Transaction.date >= start, Transaction.date < end)
        .group_by(TaxBreakdown.tax_type)
        .order_by(func.sum(TaxBreakdown.amount).desc())
    )

    result = await db.execute(stmt)
    rows = result.all()

    grand_total = sum(float(r.total) for r in rows)

    return [
        TaxTypeBreakdown(
            tax_type=row.tax_type,
            total_amount=round(float(row.total), 2),
            percentage=round(float(row.total) / grand_total, 4) if grand_total > 0 else 0,
        )
        for row in rows
    ]


def _generate_insight(
    by_type: dict[str, float],
    by_category: dict[str, dict[str, float]],
    total_taxes: float,
) -> str:
    if not by_category or total_taxes == 0:
        return "Adicione transações para ver insights sobre seus impostos."

    top_cat = max(by_category, key=lambda k: by_category[k]["taxes"])
    top_pct = by_category[top_cat]["taxes"] / total_taxes * 100

    cat_labels = {
        "combustivel": "Combustível",
        "supermercado": "Supermercado",
        "restaurante": "Restaurante",
        "farmacia": "Farmácia",
        "telefonia": "Telefonia",
        "eletronicos": "Eletrônicos",
        "vestuario": "Vestuário",
        "educacao": "Educação",
        "saude": "Saúde",
        "transporte": "Transporte",
        "outros": "Outros",
    }
    label = cat_labels.get(top_cat, top_cat.replace("_", " ").title())
    return f"{label} representou {top_pct:.0f}% de todos os impostos que você pagou este mês."
