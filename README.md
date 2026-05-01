# Multi-Source Financial Portfolio Aggregator

A full-stack application that aggregates financial data from three sources (Orders, MF Central, Account Aggregator), deduplicates overlapping records, and presents a comprehensive investment portfolio dashboard.

**Stack:** FastAPI (Python 3.11) + React 18 (Vite) + Docker

---

## Running the Project

### Option 1: Docker (Recommended — works on any machine)

**Prerequisites:** Docker + Docker Compose installed

```bash
# Clone the repo
git clone <your-repo-url>
cd FinancialPortfolioAggregator

# Build and start both services
docker-compose up --build

# App is now running at:
#   Frontend → http://localhost:3000
#   Backend API → http://localhost:8000
#   API Docs (Swagger) → http://localhost:8000/docs
```

To stop:
```bash
docker-compose down
```

---

### Option 2: Run Locally (without Docker)

**Prerequisites:** Python 3.11+, Node.js 18+, npm

#### Step 1 — Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000

# Backend is now running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

#### Step 2 — Frontend (React + Vite)

Open a new terminal tab:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev

# Frontend is now running at http://localhost:5173
```

> **Note:** In local dev mode the Vite dev server proxies all `/api` requests to `http://localhost:8000` automatically (configured in `vite.config.js`).

---

## Project Structure

```
FinancialPortfolioAggregator/
├── backend/              # FastAPI service
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── config.py     # File paths + settings
│   │   ├── api/v1/       # REST endpoints
│   │   ├── services/     # Data parsing + aggregation logic
│   │   └── models/       # Pydantic response models
│   ├── data/             # JSON source files
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── api/          # All Axios API calls
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Full page views
│   │   └── utils/        # Formatters (currency, date)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/portfolio/summary` | Net worth + asset class breakdown |
| GET | `/api/v1/portfolio/holdings` | All holdings (MF, Equity, Deposits) |
| GET | `/api/v1/portfolio/allocation` | Allocation % for pie chart |
| GET | `/api/v1/transactions` | Unified deduplicated transaction list |
| GET | `/api/v1/orders` | Order history |
| GET | `/api/v1/deduplication/report` | Deduplication evidence |

Full interactive docs available at `http://localhost:8000/docs` when running.

---

## Deduplication Strategy

### The Problem
Mutual fund holdings appear in **two** data sources:
- **MF Central** (`mf_central.json`) — transaction history with folio numbers
- **Account Aggregator** (`finarkein_aa_transactions.json`) — current holdings via Demat (CDSL)

Without deduplication, the same MF scheme would be counted twice in net worth.

### How It Works

**1. Identify overlaps using ISIN as the primary key**

Both sources carry an `isin` field on every MF record. ISINs are globally unique security identifiers — if an ISIN appears in both sources, it is the same mutual fund.

**2. Tie-break rule: Account Aggregator (AA) data takes precedence**

When an ISIN is found in both MF Central and AA, the AA record is used for:
- Current holdings value (`currentValue`)
- Units held (`closingUnits`)
- NAV

The MF Central record is flagged as a duplicate and excluded from net worth calculation.

**3. Transaction-level dedup**

For the unified transaction history, MF transactions are deduped using the composite key:
```
(isin, normalized_date, normalized_units)
```
If both sources report the same trade on the same day for the same units, only the AA record is kept.

**4. Net worth is safe from double-counting**

```
Net Worth = Deposit Balances
          + Equity Current Value (from AA equities)
          + MF Current Value    (deduplicated — each ISIN counted once)
```

### Evidence
Visit `/deduplication` in the UI or call `GET /api/v1/deduplication/report` to see:
- ISINs found in multiple sources
- Side-by-side comparison of the two source records
- The final merged record and which source won

---

## Features Implemented

### Portfolio Dashboard
- Total net worth (deduplicated across all sources)
- Asset allocation pie chart (Mutual Funds / Equities / Deposits)
- Per-asset-class value cards

### Holdings
- Mutual Fund holdings table (ISIN, scheme, units, NAV, current value, source badge)
- Equity holdings table (ISIN, company, units, last traded price, current value)
- Bank deposit accounts (masked account number, bank, balance, account type)
- Order history (scheme, ISIN, amount, date, status)

### Transactions
- Unified deduplicated transaction list across all three sources
- Filters: asset type, action (BUY/SELL), source, date range
- Color-coded BUY (green) / SELL (red) action badges
- Pagination

### Deduplication Evidence
- Stats: records before dedup, after dedup, how many removed
- Table of ISINs found in multiple sources
- Side-by-side view: MF Central entry vs AA entry vs Final merged entry

---

## Action Mapping Reference

| Source | Raw Value | Mapped To |
|--------|-----------|-----------|
| MF Central `trxnSign` | `+` | BUY |
| MF Central `trxnSign` | `-` | SELL |
| AA Deposit `type` | `DEBIT` | BUY |
| AA Deposit `type` | `CREDIT` | SELL |
| AA Equities `type` | `BUY` | BUY |
| AA Equities `type` | `SELL` | SELL |
| AA MutualFunds `type` | `BUY` | BUY |
| AA MutualFunds `type` | `SELL` | SELL |
| Order `type` | `p` (purchase) | BUY |
