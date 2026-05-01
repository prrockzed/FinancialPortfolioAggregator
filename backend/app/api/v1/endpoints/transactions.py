from fastapi import APIRouter, Query
from typing import List, Optional
from app.services import aggregator_service
from app.models.transaction import UnifiedTransaction, OrderRecord

router = APIRouter(tags=["transactions"])


@router.get("/transactions", response_model=List[UnifiedTransaction])
def get_transactions(
    asset_type: Optional[str] = Query(
        None,
        description="Filter by asset type: deposit | equities | mutual_fund | order",
    ),
    action: Optional[str] = Query(None, description="Filter by action: BUY | SELL"),
    source: Optional[str] = Query(
        None,
        description="Filter by source: aa | mf_central | order",
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(50, ge=1, le=500, description="Records per page"),
):
    """
    Returns a unified, deduplicated list of transactions across all three sources.
    Supports filtering by asset type, action, and source.
    Results are sorted newest-first.
    """
    all_txns = aggregator_service.get_transactions(
        asset_type=asset_type,
        action=action,
        source=source,
    )
    start = (page - 1) * limit
    return all_txns[start : start + limit]


@router.get("/orders", response_model=List[OrderRecord])
def get_orders():
    """
    Returns the full order history from order.json.
    All orders are BUY (type='p' = purchase).
    """
    return aggregator_service.get_orders()
