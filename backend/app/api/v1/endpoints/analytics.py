from fastapi import APIRouter, Query
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/pnl")
def pnl_summary(user_id: str = Query(default="all")):
    return analytics_service.get_pnl_summary(user_id)


@router.get("/monthly-investments")
def monthly_investments(user_id: str = Query(default="all")):
    return analytics_service.get_monthly_investments(user_id)


@router.get("/transaction-types")
def transaction_types(user_id: str = Query(default="all")):
    return analytics_service.get_transaction_types(user_id)


@router.get("/sip-summary")
def sip_summary(user_id: str = Query(default="all")):
    return analytics_service.get_sip_summary(user_id)


@router.get("/amc-exposure")
def amc_exposure(user_id: str = Query(default="all")):
    return analytics_service.get_amc_exposure(user_id)


@router.get("/deposit-cashflow")
def deposit_cashflow(user_id: str = Query(default="all")):
    return analytics_service.get_deposit_cashflow(user_id)
