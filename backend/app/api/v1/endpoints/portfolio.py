from fastapi import APIRouter
from app.services import aggregator_service
from app.models.portfolio import PortfolioSummary, HoldingsResponse, AssetAllocation
from typing import List

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
def portfolio_summary():
    """
    Returns total net worth, per-asset-class breakdown, allocation percentages,
    and quick stats (holdings count, transactions count, accounts count).
    """
    return aggregator_service.get_portfolio_summary()


@router.get("/holdings", response_model=HoldingsResponse)
def portfolio_holdings():
    """
    Returns all deduplicated holdings grouped by asset class:
    mutual_funds, equities, deposits.
    """
    return aggregator_service.get_holdings()


@router.get("/allocation", response_model=List[AssetAllocation])
def portfolio_allocation():
    """
    Returns asset allocation as a list suitable for pie charts.
    Each entry has name, value, and percentage.
    """
    return aggregator_service.get_allocation()
