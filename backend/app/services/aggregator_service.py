"""
aggregator_service.py

The central orchestrator. It:
  1. Calls all three data parsers
  2. Deduplicates MF holdings (AA wins over MF Central on ISIN conflicts)
  3. Computes net worth without double-counting
  4. Merges transactions from all sources into one unified list
  5. Produces the deduplication report for the /deduplication/report endpoint
"""

from typing import List, Tuple, Dict
from app.services import order_service, mf_central_service, aa_service
from app.models.transaction import UnifiedTransaction, OrderRecord
from app.models.holding import MFHolding, EquityHolding, DepositAccount
from app.models.portfolio import (
    NetWorth,
    AssetAllocation,
    PortfolioSummary,
    HoldingsResponse,
    DeduplicationEntry,
    DeduplicationReport,
)


# ---------------------------------------------------------------------------
# Module-level cache (loaded once at startup, reused on every request)
# ---------------------------------------------------------------------------
_cache: Dict = {}


def _ensure_loaded():
    if _cache:
        return

    # --- Parse all sources ---
    orders = order_service.get_orders()
    mfc_transactions = mf_central_service.get_transactions()
    mfc_holdings = mf_central_service.get_holdings()

    (
        deposit_accounts,
        equity_holdings,
        aa_mf_holdings,
        deposit_txns,
        equity_txns,
        aa_mf_txns,
    ) = aa_service.get_all()

    # --- Deduplication ---
    dedup_mf_holdings, dedup_report = _deduplicate_mf_holdings(
        mfc_holdings, aa_mf_holdings
    )
    dedup_mf_txns = _deduplicate_mf_transactions(mfc_transactions, aa_mf_txns)

    # --- Unified transactions ---
    all_txns = dedup_mf_txns + deposit_txns + equity_txns
    all_txns.sort(key=lambda t: t.date, reverse=True)

    # --- Order transactions (from order.json converted to UnifiedTransaction) ---
    order_txns = _orders_to_transactions(orders)

    _cache["orders"] = orders
    _cache["deposit_accounts"] = deposit_accounts
    _cache["equity_holdings"] = equity_holdings
    _cache["mf_holdings"] = dedup_mf_holdings          # deduplicated
    _cache["transactions"] = all_txns
    _cache["order_transactions"] = order_txns
    _cache["dedup_report"] = dedup_report


# ---------------------------------------------------------------------------
# Deduplication logic
# ---------------------------------------------------------------------------

def _deduplicate_mf_holdings(
    mfc_holdings: List[MFHolding],
    aa_holdings: List[MFHolding],
) -> Tuple[List[MFHolding], DeduplicationReport]:
    """
    Merge MF Central and AA mutual fund holdings.

    Strategy:
    - Build a set of ISINs from the AA holdings (AA takes precedence).
    - Any MF Central holding whose ISIN is already in AA is flagged as duplicate.
    - MF Central holdings with ISINs NOT in AA are included (no overlap).

    Returns the deduplicated list and a DeduplicationReport.
    """
    aa_isin_map: Dict[str, MFHolding] = {h.isin: h for h in aa_holdings}
    mfc_isin_map: Dict[str, MFHolding] = {h.isin: h for h in mfc_holdings}

    overlapping_isins = set(aa_isin_map.keys()) & set(mfc_isin_map.keys())

    entries: List[DeduplicationEntry] = []
    for isin in overlapping_isins:
        aa_h = aa_isin_map[isin]
        mfc_h = mfc_isin_map[isin]
        entries.append(
            DeduplicationEntry(
                isin=isin,
                scheme_name=aa_h.scheme_name,
                mf_central_record={
                    "isin": mfc_h.isin,
                    "scheme_name": mfc_h.scheme_name,
                    "amc": mfc_h.amc,
                    "folio": mfc_h.folio,
                    "units": mfc_h.units,
                    "nav": mfc_h.nav,
                    "current_value": mfc_h.current_value,
                    "source": mfc_h.source,
                },
                aa_record={
                    "isin": aa_h.isin,
                    "scheme_name": aa_h.scheme_name,
                    "amc": aa_h.amc,
                    "folio": aa_h.folio,
                    "units": aa_h.units,
                    "nav": aa_h.nav,
                    "current_value": aa_h.current_value,
                    "source": aa_h.source,
                },
                winner="aa",
                reason="Account Aggregator data takes precedence per tie-break rule.",
            )
        )

    # Build deduplicated list: AA holdings + MF Central holdings not in AA
    final_holdings: List[MFHolding] = list(aa_holdings)
    for isin, holding in mfc_isin_map.items():
        if isin not in aa_isin_map:
            final_holdings.append(holding)

    report = DeduplicationReport(
        total_mf_central_records=len(mfc_holdings),
        total_aa_mf_records=len(aa_holdings),
        overlapping_isins=len(overlapping_isins),
        records_after_dedup=len(final_holdings),
        records_removed=len(overlapping_isins),
        entries=entries,
    )

    return final_holdings, report


def _deduplicate_mf_transactions(
    mfc_txns: List[UnifiedTransaction],
    aa_mf_txns: List[UnifiedTransaction],
) -> List[UnifiedTransaction]:
    """
    Merge MF Central and AA mutual fund transactions.

    Dedup key: (isin, date, normalized_units)
    When both sources report the same trade, keep the AA record and mark the
    MF Central record as a duplicate (is_duplicate=True, excluded from output).
    """
    # Build a set of keys from AA MF transactions
    aa_keys = set()
    for t in aa_mf_txns:
        if t.isin and t.date and t.units is not None:
            key = (t.isin, t.date, round(t.units, 3))
            aa_keys.add(key)

    deduplicated: List[UnifiedTransaction] = list(aa_mf_txns)

    for t in mfc_txns:
        if t.isin and t.date and t.units is not None:
            key = (t.isin, t.date, round(t.units, 3))
            if key in aa_keys:
                # Duplicate — skip (AA record is already in deduplicated)
                continue
        deduplicated.append(t)

    return deduplicated


def _orders_to_transactions(orders: List[OrderRecord]) -> List[UnifiedTransaction]:
    return [
        UnifiedTransaction(
            id=f"ord-{o.id}",
            date=o.placed_at[:10] if o.placed_at else "",
            description=o.scheme_name,
            asset_type="order",
            action=o.action,
            amount=o.amount,
            units=None,
            nav_or_price=None,
            isin=o.isin,
            scheme_or_company=o.scheme_name,
            source="order",
            account_ref=o.investor_ucc,
        )
        for o in orders
    ]


# ---------------------------------------------------------------------------
# Public API — used by endpoint handlers
# ---------------------------------------------------------------------------

def get_portfolio_summary() -> PortfolioSummary:
    _ensure_loaded()

    deposit_accounts: List[DepositAccount] = _cache["deposit_accounts"]
    equity_holdings: List[EquityHolding] = _cache["equity_holdings"]
    mf_holdings: List[MFHolding] = _cache["mf_holdings"]
    transactions: List[UnifiedTransaction] = _cache["transactions"]

    deposits_total = sum(a.current_balance for a in deposit_accounts)
    equities_total = sum(h.current_value for h in equity_holdings)
    mf_total = sum(h.current_value for h in mf_holdings)
    total = round(deposits_total + equities_total + mf_total, 2)

    allocation = []
    if total > 0:
        allocation = [
            AssetAllocation(
                name="Mutual Funds",
                value=round(mf_total, 2),
                percentage=round((mf_total / total) * 100, 2),
                color="#6366f1",
            ),
            AssetAllocation(
                name="Equities",
                value=round(equities_total, 2),
                percentage=round((equities_total / total) * 100, 2),
                color="#22c55e",
            ),
            AssetAllocation(
                name="Deposits",
                value=round(deposits_total, 2),
                percentage=round((deposits_total / total) * 100, 2),
                color="#f59e0b",
            ),
        ]

    # Investor info from AA profile (first available)
    investor_name = ""
    investor_email = ""
    raw_users = aa_service._load_raw().get("users", [])
    if raw_users:
        user_obj = raw_users[0]
        investor_email = user_obj.get("user", {}).get("email", "")
        accounts = user_obj.get("accounts", [])
        if accounts:
            profiles = accounts[0].get("profile", [])
            if profiles:
                investor_name = profiles[0].get("name", "").strip()

    return PortfolioSummary(
        net_worth=NetWorth(
            total=total,
            mutual_funds=round(mf_total, 2),
            equities=round(equities_total, 2),
            deposits=round(deposits_total, 2),
        ),
        allocation=allocation,
        total_holdings_count=len(mf_holdings) + len(equity_holdings) + len(deposit_accounts),
        total_transactions_count=len(transactions),
        total_accounts_count=len(deposit_accounts),
        investor_name=investor_name,
        investor_email=investor_email,
    )


def get_holdings() -> HoldingsResponse:
    _ensure_loaded()
    return HoldingsResponse(
        mutual_funds=_cache["mf_holdings"],
        equities=_cache["equity_holdings"],
        deposits=_cache["deposit_accounts"],
    )


def get_allocation() -> List[AssetAllocation]:
    summary = get_portfolio_summary()
    return summary.allocation


def get_transactions(
    asset_type: str = None,
    action: str = None,
    source: str = None,
) -> List[UnifiedTransaction]:
    _ensure_loaded()
    txns = _cache["transactions"]

    if asset_type:
        txns = [t for t in txns if t.asset_type == asset_type]
    if action:
        txns = [t for t in txns if t.action == action.upper()]
    if source:
        txns = [t for t in txns if t.source == source]

    return txns


def get_orders() -> List[OrderRecord]:
    _ensure_loaded()
    return _cache["orders"]


def get_deduplication_report() -> DeduplicationReport:
    _ensure_loaded()
    return _cache["dedup_report"]
