from fastapi import APIRouter, Query
from app.services import aggregator_service
from app.models.portfolio import DeduplicationReport

router = APIRouter(prefix="/deduplication", tags=["deduplication"])


@router.get("/report", response_model=DeduplicationReport)
def deduplication_report(
    user_id: str = Query(default="all", description="User ID or 'all' for combined view"),
):
    return aggregator_service.get_deduplication_report(user_id)
