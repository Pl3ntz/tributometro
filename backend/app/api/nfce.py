from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.transaction import NFCeScanRequest, TransactionOut
from app.services.nfce_parser import NFCeParseError, parse_nfce_url
from app.services.transaction_service import create_transaction_with_taxes

router = APIRouter()


@router.post("/scan", response_model=list[TransactionOut])
async def scan_nfce(
    body: NFCeScanRequest,
    db: AsyncSession = Depends(get_db),
):
    """Scan NFCe QR Code URL and import all items."""
    try:
        nfce_data = await parse_nfce_url(body.qr_url)
    except NFCeParseError as e:
        raise HTTPException(status_code=422, detail=str(e))

    transactions = []
    for item in nfce_data.items:
        txn = await create_transaction_with_taxes(
            db,
            txn_date=__import__("datetime").date.today(),
            description=item.description,
            amount=item.amount,
            source="nfce",
            ncm=item.ncm,
            uf=nfce_data.uf,
            raw_xml=nfce_data.raw_xml if not transactions else None,
        )
        transactions.append(txn)

    await db.commit()
    return transactions
