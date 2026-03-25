"""Service to process transactions and calculate taxes through the precision hierarchy."""
import uuid
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.tax_breakdown import TaxBreakdown
from app.models.transaction import Transaction
from app.services import ibpt_service, mcc_service, ai_classifier
from app.services.tax_calculator import calculate_tax_inside


async def create_transaction_with_taxes(
    db: AsyncSession,
    *,
    txn_date: date,
    description: str,
    amount: float,
    source: str,
    ncm: str | None = None,
    mcc: str | None = None,
    category: str | None = None,
    uf: str | None = None,
    raw_xml: str | None = None,
    user_id: uuid.UUID | None = None,
) -> Transaction:
    """Create a transaction and calculate taxes using the precision hierarchy."""
    uf = uf or settings.ibpt_default_uf
    confidence = 0.0
    breakdowns: list[TaxBreakdown] = []

    # Layer 1: NCM → IBPT (highest precision)
    if ncm:
        rates = await ibpt_service.get_rates(ncm, uf)
        if rates:
            confidence = 0.95
            category = category or rates.description

            if rates.federal_rate > 0:
                pis_rate = rates.federal_rate * 0.35
                cofins_rate = rates.federal_rate * 0.65
                breakdowns.extend([
                    _make_breakdown("PIS", pis_rate, amount, "ibpt"),
                    _make_breakdown("COFINS", cofins_rate, amount, "ibpt"),
                ])

            if rates.state_rate > 0:
                breakdowns.append(
                    _make_breakdown("ICMS", rates.state_rate, amount, "ibpt")
                )

            if rates.municipal_rate > 0:
                breakdowns.append(
                    _make_breakdown("ISS", rates.municipal_rate, amount, "ibpt")
                )

            if rates.import_rate > 0:
                breakdowns.append(
                    _make_breakdown("II", rates.import_rate, amount, "ibpt")
                )

    # Layer 2: MCC → mcc_map (medium precision)
    if not breakdowns and mcc:
        tax_info = mcc_service.get_tax_info(mcc)
        if tax_info:
            confidence = 0.75
            category = category or tax_info.category

            for tax_name, rate in tax_info.taxes.items():
                tax_type = _normalize_tax_type(tax_name)
                breakdowns.append(
                    _make_breakdown(tax_type, rate, amount, "mcc_map")
                )

    # Layer 3: AI classification (fallback)
    if not breakdowns:
        ai_result = await ai_classifier.classify_transaction(description, amount)
        confidence = ai_result.confidence
        category = category or ai_result.category

        breakdowns.append(
            _make_breakdown(
                ai_result.tax_type,
                ai_result.estimated_total_rate,
                amount,
                "ai_estimate",
            )
        )

    txn = Transaction(
        id=uuid.uuid4(),
        user_id=user_id or uuid.uuid4(),
        date=txn_date,
        description=description,
        amount=amount,
        source=source,
        mcc=mcc,
        ncm=ncm,
        category=category,
        uf=uf,
        confidence=confidence,
        raw_xml=raw_xml,
    )

    for bd in breakdowns:
        bd.transaction_id = txn.id

    txn.tax_breakdowns = breakdowns
    db.add(txn)
    await db.flush()
    return txn


def _make_breakdown(
    tax_type: str, rate: float, amount: float, source_table: str
) -> TaxBreakdown:
    return TaxBreakdown(
        id=uuid.uuid4(),
        tax_type=tax_type,
        rate=round(rate, 4),
        amount=calculate_tax_inside(amount, rate),
        source_table=source_table,
    )


def _normalize_tax_type(name: str) -> str:
    """Normalize tax type names from mcc_map to enum values."""
    mapping = {
        "PIS_COFINS": "PIS",
        "PIS": "PIS",
        "COFINS": "COFINS",
        "ICMS": "ICMS",
        "ISS": "ISS",
        "IOF": "IOF",
        "IPI": "IPI",
        "CIDE": "CIDE",
        "II": "II",
    }
    return mapping.get(name, "OUTROS")
