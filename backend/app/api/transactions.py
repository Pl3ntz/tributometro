from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.services.transaction_service import create_transaction_with_taxes

router = APIRouter()


@router.post("", response_model=TransactionOut)
async def create_transaction(
    body: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a manual transaction."""
    txn = await create_transaction_with_taxes(
        db,
        txn_date=body.date,
        description=body.description,
        amount=body.amount,
        source="manual",
        ncm=body.ncm,
        mcc=body.mcc,
        category=body.category,
        uf=body.uf,
    )
    await db.commit()
    return txn


@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    month: str | None = Query(None, pattern=r"^\d{4}-\d{2}$"),
    category: str | None = None,
    source: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List transactions with optional filters."""
    stmt = select(Transaction).options(
        selectinload(Transaction.tax_breakdowns)
    ).order_by(Transaction.date.desc())

    if month:
        year, mon = month.split("-")
        start = date(int(year), int(mon), 1)
        if int(mon) == 12:
            end = date(int(year) + 1, 1, 1)
        else:
            end = date(int(year), int(mon) + 1, 1)
        stmt = stmt.where(Transaction.date >= start, Transaction.date < end)

    if category:
        stmt = stmt.where(Transaction.category == category)

    if source:
        stmt = stmt.where(Transaction.source == source)

    result = await db.execute(stmt)
    return result.scalars().all()
