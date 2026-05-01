import json
from datetime import datetime, timezone
from typing import List, Tuple
from app.config import AA_FILE
from app.models.transaction import UnifiedTransaction
from app.models.holding import MFHolding, EquityHolding, DepositAccount


def _load_raw() -> dict:
    with open(AA_FILE, "r") as f:
        return json.load(f)


def _ts_to_iso_date(timestamp_ms: int) -> str:
    """Convert millisecond epoch timestamp to ISO date string 'YYYY-MM-DD'."""
    try:
        dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return ""


def _map_deposit_action(txn_type: str) -> str:
    """DEBIT → BUY (money going out as investment), CREDIT → SELL (inflow)."""
    return "BUY" if txn_type == "DEBIT" else "SELL"


def get_deposit_accounts() -> List[DepositAccount]:
    raw = _load_raw()
    accounts: List[DepositAccount] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            summary = account.get("summary", {})
            if not isinstance(summary, dict):
                continue
            if summary.get("account_type") != "deposit":
                continue

            accounts.append(
                DepositAccount(
                    account_ref=summary.get("linkedAccRef", ""),
                    masked_account_number=summary.get("maskedAccNumber", ""),
                    bank_name=summary.get("fipName", summary.get("fipId", "")),
                    account_type=summary.get("type", "SAVINGS"),
                    current_balance=float(summary.get("currentBalance", 0)),
                    currency=summary.get("currency", "INR"),
                    status=summary.get("status", ""),
                    opening_date=summary.get("openingDate"),
                )
            )

    return accounts


def get_deposit_transactions() -> List[UnifiedTransaction]:
    raw = _load_raw()
    transactions: List[UnifiedTransaction] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            profile_list = account.get("profile", [])
            if not profile_list:
                continue
            profile = profile_list[0] if isinstance(profile_list, list) else profile_list
            if profile.get("account_type") != "deposit":
                continue

            for txn in account.get("transactions", []):
                ts = txn.get("transactionTimestamp", 0)
                iso_date = _ts_to_iso_date(ts)
                transactions.append(
                    UnifiedTransaction(
                        id=f"aa-dep-{txn.get('txnId', '')}",
                        date=iso_date,
                        description=txn.get("narration", ""),
                        asset_type="deposit",
                        action=_map_deposit_action(txn.get("type", "DEBIT")),
                        amount=float(txn.get("amount", 0)),
                        units=None,
                        nav_or_price=None,
                        isin=None,
                        scheme_or_company=txn.get("mode", ""),
                        source="aa",
                        account_ref=txn.get("linkedAccRef"),
                    )
                )

    return transactions


def get_equity_holdings() -> List[EquityHolding]:
    raw = _load_raw()
    holdings: List[EquityHolding] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            summary_list = account.get("summary", [])
            if not isinstance(summary_list, list):
                continue

            for item in summary_list:
                if item.get("account_type") != "equities":
                    continue
                holdings.append(
                    EquityHolding(
                        isin=item.get("isin", ""),
                        company_name=item.get("issuerName", item.get("isinDescription", "")),
                        units=float(item.get("units", 0)),
                        last_traded_price=float(item.get("lastTradedPrice", 0)),
                        current_value=float(item.get("currentValue", 0)),
                    )
                )

    return holdings


def get_equity_transactions() -> List[UnifiedTransaction]:
    raw = _load_raw()
    transactions: List[UnifiedTransaction] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            profile_list = account.get("profile", [])
            if not profile_list:
                continue
            profile = profile_list[0] if isinstance(profile_list, list) else profile_list
            if profile.get("account_type") != "equities":
                continue

            for txn in account.get("transactions", []):
                ts = txn.get("transactionDate", 0)
                iso_date = _ts_to_iso_date(ts)
                transactions.append(
                    UnifiedTransaction(
                        id=f"aa-eq-{txn.get('txnId', '')}",
                        date=iso_date,
                        description=txn.get("narration", txn.get("isinDescription", "")),
                        asset_type="equities",
                        action=txn.get("type", "BUY").upper(),
                        amount=float(txn.get("amount", 0) or 0),
                        units=float(txn.get("units", 0) or 0),
                        nav_or_price=float(txn.get("nav", 0) or 0),
                        isin=txn.get("isin"),
                        scheme_or_company=txn.get("isinDescription", ""),
                        source="aa",
                        account_ref=txn.get("linkedAccRef"),
                    )
                )

    return transactions


def get_mf_holdings() -> List[MFHolding]:
    raw = _load_raw()
    holdings: List[MFHolding] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            summary_list = account.get("summary", [])
            if not isinstance(summary_list, list):
                continue

            for item in summary_list:
                if item.get("account_type") != "mutualfunds":
                    continue
                holdings.append(
                    MFHolding(
                        isin=item.get("isin", ""),
                        scheme_name=item.get("isinDescription", ""),
                        amc=item.get("amc"),
                        folio=item.get("folioNo"),
                        units=float(item.get("closingUnits", 0) or 0),
                        nav=float(item.get("nav", 0) or 0),
                        current_value=float(item.get("currentValue", 0) or 0),
                        source="aa",
                        is_deduplicated=True,
                    )
                )

    return holdings


def get_mf_transactions() -> List[UnifiedTransaction]:
    raw = _load_raw()
    transactions: List[UnifiedTransaction] = []

    for user in raw.get("users", []):
        for account in user.get("accounts", []):
            profile_list = account.get("profile", [])
            if not profile_list:
                continue
            profile = profile_list[0] if isinstance(profile_list, list) else profile_list
            if profile.get("account_type") != "mutualfunds":
                continue

            for txn in account.get("transactions", []):
                ts = txn.get("transactionDate", 0)
                iso_date = _ts_to_iso_date(ts)
                units_val = txn.get("units", 0) or 0
                transactions.append(
                    UnifiedTransaction(
                        id=f"aa-mf-{txn.get('txnId', '')}",
                        date=iso_date,
                        description=txn.get("narration", txn.get("isinDescription", "")),
                        asset_type="mutual_fund",
                        action=txn.get("type", "BUY").upper(),
                        amount=float(txn.get("amount", 0) or 0),
                        units=float(units_val),
                        nav_or_price=float(txn.get("nav", 0) or 0),
                        isin=txn.get("isin"),
                        scheme_or_company=txn.get("isinDescription", ""),
                        source="aa",
                        account_ref=txn.get("linkedAccRef"),
                    )
                )

    return transactions


def get_all() -> Tuple[
    List[DepositAccount],
    List[EquityHolding],
    List[MFHolding],
    List[UnifiedTransaction],
    List[UnifiedTransaction],
    List[UnifiedTransaction],
    List[UnifiedTransaction],
]:
    """
    Convenience function: returns all parsed AA data in one call.
    Returns: (deposit_accounts, equity_holdings, mf_holdings,
              deposit_txns, equity_txns, mf_txns)
    """
    return (
        get_deposit_accounts(),
        get_equity_holdings(),
        get_mf_holdings(),
        get_deposit_transactions(),
        get_equity_transactions(),
        get_mf_transactions(),
    )
