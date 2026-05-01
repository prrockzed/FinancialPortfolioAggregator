from pydantic import BaseModel
from typing import Optional


class UnifiedTransaction(BaseModel):
    id: str
    date: str                   # ISO date string: "2025-12-18"
    description: str
    asset_type: str             # "deposit" | "equities" | "mutual_fund" | "order"
    action: str                 # "BUY" | "SELL"
    amount: Optional[float]
    units: Optional[float]
    nav_or_price: Optional[float]
    isin: Optional[str]
    scheme_or_company: Optional[str]
    source: str                 # "aa" | "mf_central" | "order"
    account_ref: Optional[str]
    is_duplicate: bool = False  # True if superseded by another source


class OrderRecord(BaseModel):
    id: str
    scheme_code: str
    scheme_name: str
    isin: Optional[str]
    amount: float
    placed_at: str              # ISO datetime string
    status: str
    action: str                 # always "BUY" for type="p"
    investor_ucc: str
    source: str = "order"
