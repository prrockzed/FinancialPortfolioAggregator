from pathlib import Path

# Root of the backend package
BASE_DIR = Path(__file__).resolve().parent.parent

# JSON data file paths
DATA_DIR = BASE_DIR / "data"
ORDER_FILE = DATA_DIR / "order.json"
MF_CENTRAL_FILE = DATA_DIR / "mf_central.json"
AA_FILE = DATA_DIR / "finarkein_aa_transactions.json"

# API metadata
API_TITLE = "Financial Portfolio Aggregator API"
API_VERSION = "1.0.0"
API_PREFIX = "/api/v1"
