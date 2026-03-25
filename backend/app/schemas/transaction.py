from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TaxBreakdownOut(BaseModel):
    tax_type: str
    rate: float
    amount: float
    source_table: str

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    date: date
    description: str = Field(min_length=1, max_length=500)
    amount: float = Field(gt=0)
    category: str | None = None
    uf: str | None = Field(default=None, max_length=2)
    mcc: str | None = None
    ncm: str | None = None


class TransactionOut(BaseModel):
    id: UUID
    date: date
    description: str
    amount: float
    source: str
    mcc: str | None = None
    ncm: str | None = None
    category: str | None = None
    uf: str | None = None
    confidence: float | None = None
    created_at: datetime
    tax_breakdowns: list[TaxBreakdownOut] = []

    model_config = {"from_attributes": True}


class NFCeScanRequest(BaseModel):
    qr_url: str = Field(min_length=10)


class DashboardSummary(BaseModel):
    period: str
    total_spent: float
    total_taxes: float
    effective_tax_rate: float
    breakdown_by_type: dict[str, float]
    breakdown_by_category: dict[str, dict[str, float]]
    precision_summary: dict[str, int]
    top_insight: str


class MonthlyData(BaseModel):
    month: str
    total_spent: float
    total_taxes: float


class TaxTypeBreakdown(BaseModel):
    tax_type: str
    total_amount: float
    percentage: float
