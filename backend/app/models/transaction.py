import uuid
from datetime import date, datetime

from sqlalchemy import Date, Enum, Float, Numeric, String, Text
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    source: Mapped[str] = mapped_column(
        Enum("nfce", "ofx", "manual", name="source_enum"), nullable=False
    )
    mcc: Mapped[str | None] = mapped_column(String(10))
    ncm: Mapped[str | None] = mapped_column(String(10))
    category: Mapped[str | None] = mapped_column(String(60))
    uf: Mapped[str | None] = mapped_column(String(2))
    confidence: Mapped[float | None] = mapped_column(Float)
    raw_xml: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )

    tax_breakdowns: Mapped[list["TaxBreakdown"]] = relationship(
        "TaxBreakdown", back_populates="transaction", cascade="all, delete-orphan"
    )
