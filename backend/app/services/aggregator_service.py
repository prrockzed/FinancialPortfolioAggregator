"""
aggregator_service.py

The central orchestrator. It:
  1. Calls all three data parsers (optionally filtered to a single user)
  2. Deduplicates MF holdings (AA wins over MF Central on ISIN conflicts)
  3. Computes net worth without double-counting
  4. Merges transactions from all sources into one unified list
  5. Produces the deduplication report for the /deduplication/report endpoint

user_id = "all"  → aggregate data from all 7 users (default)
user_id = "pivot_asgmt_user_001"  → filter to that specific user only
"""

from typing import List, Tuple, Dict
from app.services import order_service, mf_central_service, aa_service, user_service
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
# Module-level cache keyed by user_id ("all" or a specific userId)
# ---------------------------------------------------------------------------
_cache: Dict[str, Dict] = {}


def _ensure_loaded(user_id: str):
    if user_id in _cache:
        return

    # Resolve email filter for MF Central
    # When user_id == "all", pass "all" → no filtering
    # When specific, look up the corresponding email
    if user_id == "all":
        mfc_email = "all"
    else:
        mfc_email = user_service.get_user_email(user_id)

    # --- Parse all sources ---
    orders = order_service.get_orders()  # orders are global (no user linkage in order.json)
    mfc_transactions = mf_central_service.get_transactions(mfc_email)
    mfc_holdings = mf_central_service.get_holdings(mfc_email)

    (
        deposit_accounts,
        equity_holdings,
        aa_mf_holdings,
        deposit_txns,
        equity_txns,
        aa_mf_txns,
    ) = aa_service.get_all(user_id)

    # --- Deduplication ---
    dedup_mf_holdings, dedup_report = _deduplicate_mf_holdings(
        mfc_holdings, aa_mf_holdings
    )
    dedup_mf_txns = _deduplicate_mf_transactions(mfc_transactions, aa_mf_txns)

    # --- Annotate holdings with cost basis from MF Central BUY amounts ---
    cost_basis = _build_cost_basis(mfc_transactions)
    for h in dedup_mf_holdings:
        if h.isin in cost_basis:
            h.cost_value = round(cost_basis[h.isin], 2)
            h.gain_loss = round(h.current_value - h.cost_value, 2)
            if h.cost_value > 0:
                h.gain_loss_pct = round((h.gain_loss / h.cost_value) * 100, 2)

    # --- Unified transactions ---
    all_txns = dedup_mf_txns + deposit_txns + equity_txns
    all_txns.sort(key=lambda t: t.date, reverse=True)

    # --- Order transactions (global, not per-user) ---
    order_txns = _orders_to_transactions(orders)

    _cache[user_id] = {
        "orders": orders,
        "deposit_accounts": deposit_accounts,
        "equity_holdings": equity_holdings,
        "mf_holdings": dedup_mf_holdings,
        "transactions": all_txns,
        "order_transactions": order_txns,
        "dedup_report": dedup_report,
        "mfc_email": mfc_email,
    }


# ---------------------------------------------------------------------------
# Deduplication logic
# ---------------------------------------------------------------------------

def _deduplicate_mf_holdings(
    mfc_holdings: List[MFHolding],
    aa_holdings: List[MFHolding],
) -> Tuple[List[MFHolding], DeduplicationReport]:
    # Sum current_value across users with the same ISIN in AA.
    # In single-user mode: each ISIN appears once → no change.
    # In "all" mode: same ISIN from 7 users → values are summed to match
    # MFC which already sums units across all users.
    aa_isin_map: Dict[str, MFHolding] = {}
    for h in aa_holdings:
        if h.isin in aa_isin_map:
            existing = aa_isin_map[h.isin]
            aa_isin_map[h.isin] = existing.model_copy(
                update={"current_value": round(existing.current_value + h.current_value, 2)}
            )
        else:
            aa_isin_map[h.isin] = h

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

    final_holdings: List[MFHolding] = list(aa_isin_map.values())
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
                continue
        deduplicated.append(t)

    return deduplicated


def _build_cost_basis(mfc_transactions: List[UnifiedTransaction]) -> Dict[str, float]:
    """Build {isin: total_buy_amount} from MF Central BUY transactions."""
    cost_map: Dict[str, float] = {}
    for t in mfc_transactions:
        if t.isin and t.action == "BUY" and t.amount:
            cost_map[t.isin] = cost_map.get(t.isin, 0.0) + t.amount
    return cost_map


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

def get_portfolio_summary(user_id: str = "all") -> PortfolioSummary:
    _ensure_loaded(user_id)
    data = _cache[user_id]

    deposit_accounts: List[DepositAccount] = data["deposit_accounts"]
    equity_holdings: List[EquityHolding] = data["equity_holdings"]
    mf_holdings: List[MFHolding] = data["mf_holdings"]
    transactions: List[UnifiedTransaction] = data["transactions"]

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

    # Investor info from AA profile
    investor_name = ""
    investor_email = ""
    if user_id == "all":
        investor_name = "All Users"
        investor_email = "7 portfolios combined"
    else:
        raw_users = aa_service._load_raw().get("users", [])
        for u in raw_users:
            if u.get("user", {}).get("userId") == user_id:
                investor_email = u.get("user", {}).get("email", "")
                for acc in u.get("accounts", []):
                    profiles = acc.get("profile", [])
                    if profiles:
                        investor_name = profiles[0].get("name", "").strip()
                        break
                break

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


def get_holdings(user_id: str = "all") -> HoldingsResponse:
    _ensure_loaded(user_id)
    data = _cache[user_id]
    return HoldingsResponse(
        mutual_funds=data["mf_holdings"],
        equities=data["equity_holdings"],
        deposits=data["deposit_accounts"],
    )


def get_allocation(user_id: str = "all") -> List[AssetAllocation]:
    return get_portfolio_summary(user_id).allocation


def get_transactions(
    user_id: str = "all",
    asset_type: str = None,
    action: str = None,
    source: str = None,
) -> List[UnifiedTransaction]:
    _ensure_loaded(user_id)
    txns = _cache[user_id]["transactions"]

    if asset_type:
        txns = [t for t in txns if t.asset_type == asset_type]
    if action:
        txns = [t for t in txns if t.action == action.upper()]
    if source:
        txns = [t for t in txns if t.source == source]

    return txns


def get_orders() -> List[OrderRecord]:
    # Orders are global (no per-user linkage in order.json)
    _ensure_loaded("all")
    return _cache["all"]["orders"]


def get_deduplication_report(user_id: str = "all") -> DeduplicationReport:
    _ensure_loaded(user_id)
    return _cache[user_id]["dedup_report"]
