import uuid

from sqlalchemy import Enum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TaxBreakdown(Base):
    __tablename__ = "tax_breakdowns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    tax_type: Mapped[str] = mapped_column(
        Enum(
            "ICMS", "IPI", "ISS", "PIS", "COFINS", "IOF", "CIDE", "II", "OUTROS",
            name="tax_type_enum",
        ),
        nullable=False,
    )
    rate: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    source_table: Mapped[str] = mapped_column(
        Enum("ibpt", "mcc_map", "ai_estimate", name="source_table_enum"),
        nullable=False,
    )

    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="tax_breakdowns"
    )
