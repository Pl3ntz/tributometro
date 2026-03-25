from dataclasses import dataclass
from datetime import date
from io import BytesIO

from ofxparse import OfxParser


class OFXParseError(Exception):
    """Error parsing OFX file."""


@dataclass(frozen=True)
class OFXTransaction:
    date: date
    description: str
    amount: float
    mcc: str


def parse_ofx(content: bytes) -> list[OFXTransaction]:
    """Parse OFX file bytes into transactions."""
    try:
        ofx = OfxParser.parse(BytesIO(content))
    except Exception as e:
        raise OFXParseError(f"Arquivo OFX inválido: {e}")

    transactions = []
    for account in ofx.accounts if hasattr(ofx, "accounts") else [ofx.account]:
        if not account or not account.statement:
            continue

        for txn in account.statement.transactions:
            if txn.amount >= 0:
                continue  # Skip credits

            transactions.append(OFXTransaction(
                date=txn.date.date() if hasattr(txn.date, "date") else txn.date,
                description=txn.memo or txn.payee or "Transação OFX",
                amount=abs(float(txn.amount)),
                mcc=getattr(txn, "mcc", "") or "",
            ))

    return transactions


def parse_csv_transactions(content: str) -> list[OFXTransaction]:
    """Parse CSV bank statement. Expects columns: date, description, amount."""
    import csv
    from io import StringIO
    from dateutil.parser import parse as parse_date

    reader = csv.reader(StringIO(content))
    header = next(reader, None)
    if not header:
        raise OFXParseError("CSV vazio ou sem cabeçalho")

    transactions = []
    for row in reader:
        if len(row) < 3:
            continue

        try:
            txn_date = parse_date(row[0], dayfirst=True).date()
            description = row[1].strip()
            amount = abs(float(row[2].replace(",", ".").replace("R$", "").strip()))

            if amount == 0:
                continue

            mcc = row[3].strip() if len(row) > 3 else ""

            transactions.append(OFXTransaction(
                date=txn_date,
                description=description,
                amount=amount,
                mcc=mcc,
            ))
        except (ValueError, IndexError):
            continue

    return transactions
