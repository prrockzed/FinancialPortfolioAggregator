from pydantic import BaseModel
from typing import List
from app.models.holding import MFHolding, EquityHolding, DepositAccount


class AssetAllocation(BaseModel):
    name: str           # "Mutual Funds" | "Equities" | "Deposits"
    value: float
    percentage: float
    color: str          # hex color for charts


class NetWorth(BaseModel):
    total: float
    mutual_funds: float
    equities: float
    deposits: float


class PortfolioSummary(BaseModel):
    net_worth: NetWorth
    allocation: List[AssetAllocation]
    total_holdings_count: int
    total_transactions_count: int
    total_accounts_count: int
    investor_name: str
    investor_email: str


class HoldingsResponse(BaseModel):
    mutual_funds: List[MFHolding]
    equities: List[EquityHolding]
    deposits: List[DepositAccount]


class DeduplicationEntry(BaseModel):
    isin: str
    scheme_name: str
    mf_central_record: dict
    aa_record: dict
    winner: str         # "aa" | "mf_central"
    reason: str


class DeduplicationReport(BaseModel):
    total_mf_central_records: int
    total_aa_mf_records: int
    overlapping_isins: int
    records_after_dedup: int
    records_removed: int
    entries: List[DeduplicationEntry]
