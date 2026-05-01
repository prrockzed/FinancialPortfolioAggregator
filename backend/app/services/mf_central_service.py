import json
from typing import List, Dict, Any
from app.config import MF_CENTRAL_FILE
from app.models.transaction import UnifiedTransaction
from app.models.holding import MFHolding


def _load_raw() -> dict:
    with open(MF_CENTRAL_FILE, "r") as f:
        return json.load(f)


def _parse_date(raw_date: str) -> str:
    """
    Convert MF Central date strings like '18-DEC-2025' to ISO format '2025-12-18'.
    """
    month_map = {
        "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04",
        "MAY": "05", "JUN": "06", "JUL": "07", "AUG": "08",
        "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12",
    }
    try:
        parts = raw_date.strip().split("-")
        day, month_abbr, year = parts[0], parts[1].upper(), parts[2]
        return f"{year}-{month_map.get(month_abbr, '01')}-{day.zfill(2)}"
    except Exception:
        return raw_date


def _map_action(trxn_sign: str) -> str:
    """trxnSign '+' → BUY, '-' → SELL"""
    return "BUY" if trxn_sign == "+" else "SELL"


def get_transactions() -> List[UnifiedTransaction]:
    """
    Extract all MF transactions from mf_central.json.
    Returns a flat list of UnifiedTransaction objects.
    """
    raw = _load_raw()
    transactions: List[UnifiedTransaction] = []

    for user in raw.get("users", []):
        qr_data = user.get("validateQRCode", {})
        for data_block in qr_data.get("data", []):
            for trxn in data_block.get("dtTransaction", []):
                iso_date = _parse_date(trxn.get("trxnDate", ""))
                isin = trxn.get("isin", "")
                units_str = trxn.get("trxnUnits", "0") or "0"
                amount_str = trxn.get("trxnAmount", "0") or "0"
                price_str = trxn.get("purchasePrice", "0") or "0"

                tx = UnifiedTransaction(
                    id=f"mfc-{trxn.get('folio', '')}-{iso_date}-{units_str}",
                    date=iso_date,
                    description=trxn.get("trxnDesc", trxn.get("schemeName", "")),
                    asset_type="mutual_fund",
                    action=_map_action(trxn.get("trxnSign", "+")),
                    amount=float(amount_str),
                    units=float(units_str),
                    nav_or_price=float(price_str),
                    isin=isin if isin else None,
                    scheme_or_company=trxn.get("schemeName", ""),
                    source="mf_central",
                    account_ref=trxn.get("folio"),
                )
                transactions.append(tx)

    return transactions


def get_holdings() -> List[MFHolding]:
    """
    Build a synthetic list of MF holdings from MF Central transaction history.
    We sum up units per ISIN (BUY adds units, SELL subtracts).
    We also capture the latest scheme name and AMC per ISIN.
    """
    raw = _load_raw()

    # isin → { units, scheme_name, amc, folio, last_price }
    holding_map: Dict[str, Dict[str, Any]] = {}

    for user in raw.get("users", []):
        qr_data = user.get("validateQRCode", {})
        for data_block in qr_data.get("data", []):
            for trxn in data_block.get("dtTransaction", []):
                isin = trxn.get("isin", "").strip()
                if not isin:
                    continue

                units_str = trxn.get("trxnUnits", "0") or "0"
                price_str = trxn.get("purchasePrice", "0") or "0"
                delta = float(units_str)
                if trxn.get("trxnSign") == "-":
                    delta = -delta

                if isin not in holding_map:
                    holding_map[isin] = {
                        "units": 0.0,
                        "scheme_name": trxn.get("schemeName", ""),
                        "amc": trxn.get("amcName", ""),
                        "folio": trxn.get("folio", ""),
                        "last_price": float(price_str),
                    }
                holding_map[isin]["units"] += delta
                if price_str:
                    holding_map[isin]["last_price"] = float(price_str)

    holdings: List[MFHolding] = []
    for isin, data in holding_map.items():
        units = round(data["units"], 4)
        if units <= 0:
            continue
        current_value = round(units * data["last_price"], 2)
        holdings.append(
            MFHolding(
                isin=isin,
                scheme_name=data["scheme_name"],
                amc=data["amc"],
                folio=data["folio"],
                units=units,
                nav=data["last_price"],
                current_value=current_value,
                source="mf_central",
            )
        )

    return holdings
