from pydantic import BaseModel
from typing import Optional


class MFHolding(BaseModel):
    isin: str
    scheme_name: str
    amc: Optional[str]
    folio: Optional[str]
    units: float
    nav: Optional[float]
    current_value: float
    source: str                 # "aa" | "mf_central"
    is_deduplicated: bool = False   # True = this record was the winner after dedup


class EquityHolding(BaseModel):
    isin: str
    company_name: str
    units: float
    last_traded_price: float
    current_value: float
    source: str = "aa"


class DepositAccount(BaseModel):
    account_ref: str            # linkedAccRef (UUID)
    masked_account_number: str
    bank_name: str              # fipId
    account_type: str           # "SAVINGS" | "CURRENT"
    current_balance: float
    currency: str
    status: str
    opening_date: Optional[str]
    source: str = "aa"
