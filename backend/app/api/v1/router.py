from fastapi import APIRouter
from app.api.v1.endpoints import portfolio, transactions, deduplication, users, analytics

router = APIRouter()

router.include_router(users.router)
router.include_router(portfolio.router)
router.include_router(transactions.router)
router.include_router(deduplication.router)
router.include_router(analytics.router)
