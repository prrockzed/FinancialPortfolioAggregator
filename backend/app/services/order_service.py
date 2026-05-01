import json
from typing import List
from app.config import ORDER_FILE
from app.models.transaction import OrderRecord


def _load_raw() -> list:
    with open(ORDER_FILE, "r") as f:
        return json.load(f)


def get_orders() -> List[OrderRecord]:
    """
    Parse order.json and return a list of OrderRecord objects.

    All records have type="p" (purchase) so every order is mapped to BUY.
    """
    raw_orders = _load_raw()
    result: List[OrderRecord] = []

    for order in raw_orders:
        order_src = order.get("order_src_info", {})
        isin = order_src.get("src_isin") or None

        record = OrderRecord(
            id=str(order.get("id", "")),
            scheme_code=order.get("scheme", ""),
            scheme_name=order.get("src_scheme_name", ""),
            isin=isin if isin else None,
            amount=float(order.get("amount", 0)),
            placed_at=order.get("placed_at", ""),
            status=order.get("status", ""),
            action="BUY",   # type="p" means purchase
            investor_ucc=order.get("investor", {}).get("ucc", ""),
        )
        result.append(record)

    return result
