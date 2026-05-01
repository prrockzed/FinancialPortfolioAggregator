from fastapi import APIRouter, Query
from app.services import aggregator_service
from app.models.portfolio import PortfolioSummary, HoldingsResponse, AssetAllocation
from typing import List

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
def portfolio_summary(
    user_id: str = Query(default="all", description="User ID or 'all' for combined view"),
):
    return aggregator_service.get_portfolio_summary(user_id)


@router.get("/holdings", response_model=HoldingsResponse)
def portfolio_holdings(
    user_id: str = Query(default="all", description="User ID or 'all' for combined view"),
):
    return aggregator_service.get_holdings(user_id)


@router.get("/allocation", response_model=List[AssetAllocation])
def portfolio_allocation(
    user_id: str = Query(default="all", description="User ID or 'all' for combined view"),
):
    return aggregator_service.get_allocation(user_id)
