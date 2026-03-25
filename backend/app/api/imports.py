from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.transaction import TransactionOut
from app.services.ofx_parser import OFXParseError, parse_csv_transactions, parse_ofx
from app.services.transaction_service import create_transaction_with_taxes

router = APIRouter()


@router.post("/ofx", response_model=list[TransactionOut])
async def import_ofx(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    """Import transactions from OFX file."""
    content = await file.read()
    try:
        ofx_transactions = parse_ofx(content)
    except OFXParseError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not ofx_transactions:
        raise HTTPException(status_code=422, detail="Nenhuma transação encontrada no arquivo OFX.")

    transactions = []
    for otxn in ofx_transactions:
        txn = await create_transaction_with_taxes(
            db,
            txn_date=otxn.date,
            description=otxn.description,
            amount=otxn.amount,
            source="ofx",
            mcc=otxn.mcc or None,
        )
        transactions.append(txn)

    await db.commit()
    return transactions


@router.post("/csv", response_model=list[TransactionOut])
async def import_csv(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    """Import transactions from CSV file."""
    content = (await file.read()).decode("utf-8-sig")
    try:
        csv_transactions = parse_csv_transactions(content)
    except OFXParseError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not csv_transactions:
        raise HTTPException(status_code=422, detail="Nenhuma transação encontrada no arquivo CSV.")

    transactions = []
    for ctxn in csv_transactions:
        txn = await create_transaction_with_taxes(
            db,
            txn_date=ctxn.date,
            description=ctxn.description,
            amount=ctxn.amount,
            source="ofx",
            mcc=ctxn.mcc or None,
        )
        transactions.append(txn)

    await db.commit()
    return transactions
