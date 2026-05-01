"""
analytics_service.py

Provides computed analytics beyond the base portfolio endpoints:
  - P&L summary (total invested vs current value)
  - Monthly investment trend (BUY amounts grouped by month)
  - Transaction type breakdown (SIP, Purchase, Switch, etc.)
  - SIP analysis (active schemes, estimated monthly, installment count)
  - AMC exposure (fund house allocation)
  - Deposit cash flow (CREDIT vs DEBIT)
"""

from collections import defaultdict
from typing import Dict, List
from app.services import mf_central_service, aa_service, aggregator_service, user_service


FLAG_LABELS = {
    "SIN": "SIP",
    "PUR": "Purchase",
    "SWO": "Switch Out",
    "SWI": "Switch In",
    "LUM": "Lump Sum",
    "DRP": "Dividend Reinvest",
}


def _mfc_email(user_id: str) -> str:
    if user_id == "all":
        return "all"
    return user_service.get_user_email(user_id)


# ---------------------------------------------------------------------------
# P&L Summary
# ---------------------------------------------------------------------------

def get_pnl_summary(user_id: str = "all") -> dict:
    holdings_resp = aggregator_service.get_holdings(user_id)
    mf_holdings = holdings_resp.mutual_funds

    current_value = round(sum(h.current_value for h in mf_holdings), 2)
    holdings_with_cost = [h for h in mf_holdings if h.cost_value is not None]
    total_invested = round(sum(h.cost_value for h in holdings_with_cost), 2)

    gain_loss = round(current_value - total_invested, 2) if total_invested > 0 else None
    gain_loss_pct = round((gain_loss / total_invested) * 100, 2) if total_invested and total_invested > 0 else None

    return {
        "total_invested": total_invested,
        "current_value": current_value,
        "gain_loss": gain_loss,
        "gain_loss_pct": gain_loss_pct,
        "holdings_with_cost_data": len(holdings_with_cost),
        "total_mf_holdings": len(mf_holdings),
    }


# ---------------------------------------------------------------------------
# Monthly Investment Trend
# ---------------------------------------------------------------------------

def get_monthly_investments(user_id: str = "all") -> list:
    raw_txns = mf_central_service.get_raw_transactions(_mfc_email(user_id))
    monthly: Dict[str, float] = defaultdict(float)

    for t in raw_txns:
        if t.get("trxnSign") == "+":
            try:
                date = mf_central_service._parse_date(t.get("trxnDate", ""))
                month = date[:7]
                monthly[month] += float(t.get("trxnAmount", 0) or 0)
            except Exception:
                pass

    result = [{"month": m, "amount": round(v, 2)} for m, v in sorted(monthly.items())]
    return result[-12:]  # last 12 months


# ---------------------------------------------------------------------------
# Transaction Type Breakdown
# ---------------------------------------------------------------------------

def get_transaction_types(user_id: str = "all") -> list:
    raw_txns = mf_central_service.get_raw_transactions(_mfc_email(user_id))
    flag_map: Dict[str, dict] = defaultdict(lambda: {"count": 0, "total_amount": 0.0})

    for t in raw_txns:
        flag = t.get("trxnTypeFlag") or "OTHER"
        try:
            amount = abs(float(t.get("trxnAmount", 0) or 0))
        except (TypeError, ValueError):
            amount = 0.0
        flag_map[flag]["count"] += 1
        flag_map[flag]["total_amount"] += amount

    total_amount = sum(d["total_amount"] for d in flag_map.values())
    result = []
    for flag, data in sorted(flag_map.items(), key=lambda x: -x[1]["total_amount"]):
        result.append({
            "flag": flag,
            "label": FLAG_LABELS.get(flag, flag),
            "count": data["count"],
            "total_amount": round(data["total_amount"], 2),
            "percentage": round((data["total_amount"] / total_amount) * 100, 1) if total_amount > 0 else 0.0,
        })
    return result


# ---------------------------------------------------------------------------
# SIP Analysis
# ---------------------------------------------------------------------------

def get_sip_summary(user_id: str = "all") -> dict:
    raw_txns = mf_central_service.get_raw_transactions(_mfc_email(user_id))
    sip_txns = [t for t in raw_txns if t.get("trxnTypeFlag") == "SIN"]

    schemes: Dict[str, dict] = defaultdict(lambda: {"name": "", "installments": 0, "last_amount": 0.0})
    for t in sip_txns:
        isin = t.get("isin") or t.get("schemeName", "UNKNOWN")
        schemes[isin]["name"] = t.get("schemeName", isin)
        schemes[isin]["installments"] += 1
        try:
            schemes[isin]["last_amount"] = abs(float(t.get("trxnAmount", 0) or 0))
        except (TypeError, ValueError):
            pass

    total_installments = sum(s["installments"] for s in schemes.values())
    estimated_monthly = round(sum(s["last_amount"] for s in schemes.values()), 2)

    scheme_list = sorted(
        [
            {
                "isin": isin,
                "name": data["name"],
                "installments": data["installments"],
                "monthly_amount": round(data["last_amount"], 2),
            }
            for isin, data in schemes.items()
        ],
        key=lambda x: -x["monthly_amount"],
    )

    return {
        "active_schemes": len(schemes),
        "estimated_monthly_sip": estimated_monthly,
        "total_installments": total_installments,
        "schemes": scheme_list,
    }


# ---------------------------------------------------------------------------
# AMC Exposure
# ---------------------------------------------------------------------------

def get_amc_exposure(user_id: str = "all") -> list:
    holdings_resp = aggregator_service.get_holdings(user_id)
    mf_holdings = holdings_resp.mutual_funds

    amc_map: Dict[str, float] = defaultdict(float)
    for h in mf_holdings:
        amc_map[h.amc or "Unknown"] += h.current_value

    total = sum(amc_map.values())
    return sorted(
        [
            {
                "amc": amc,
                "total_value": round(v, 2),
                "percentage": round((v / total) * 100, 1) if total > 0 else 0.0,
            }
            for amc, v in amc_map.items()
        ],
        key=lambda x: -x["total_value"],
    )


# ---------------------------------------------------------------------------
# Deposit Cash Flow
# ---------------------------------------------------------------------------

def get_deposit_cashflow(user_id: str = "all") -> dict:
    txns = aa_service.get_deposit_transactions(user_id)

    # In aa_service: CREDIT → action="SELL" (money in), DEBIT → action="BUY" (money out)
    total_credit = round(sum(t.amount for t in txns if t.action == "SELL"), 2)
    total_debit = round(sum(t.amount for t in txns if t.action == "BUY"), 2)

    return {
        "total_credit": total_credit,
        "total_debit": total_debit,
        "net_cashflow": round(total_credit - total_debit, 2),
        "total_transactions": len(txns),
        "credit_count": sum(1 for t in txns if t.action == "SELL"),
        "debit_count": sum(1 for t in txns if t.action == "BUY"),
    }
