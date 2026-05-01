from fastapi import APIRouter
from app.services import aggregator_service
from app.models.portfolio import DeduplicationReport

router = APIRouter(prefix="/deduplication", tags=["deduplication"])


@router.get("/report", response_model=DeduplicationReport)
def deduplication_report():
    """
    Returns evidence of the deduplication process:
    - How many MF records existed in each source
    - Which ISINs overlapped between MF Central and Account Aggregator
    - For each overlap: the MF Central record, the AA record, and which won
    - Before/after counts to prove no double-counting
    """
    return aggregator_service.get_deduplication_report()
