from sqlalchemy import Integer, Numeric, String, Text

from app.models.base import Base
from sqlalchemy.orm import Mapped, mapped_column


class IbptRate(Base):
    __tablename__ = "ibpt_rates"

    ncm: Mapped[str] = mapped_column(String(10), primary_key=True)
    uf: Mapped[str] = mapped_column(String(2), primary_key=True)
    year: Mapped[int] = mapped_column(Integer, primary_key=True)
    semester: Mapped[int] = mapped_column(Integer, primary_key=True)
    description: Mapped[str | None] = mapped_column(Text)
    federal_rate: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    state_rate: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    municipal_rate: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    import_rate: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    total_rate: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
