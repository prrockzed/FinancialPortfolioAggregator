# Multi-Source Financial Portfolio Aggregator

A full-stack application that aggregates financial data from three sources (Orders, MF Central, Account Aggregator), deduplicates overlapping records, and presents a comprehensive investment portfolio dashboard with analytics.

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
│   │   ├── services/     # Data parsing + aggregation + analytics logic
│   │   └── models/       # Pydantic response models
│   ├── data/             # JSON source files
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── api/          # All Axios API calls
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (global user selection state)
│   │   ├── pages/        # Full page views
│   │   └── utils/        # Formatters (currency, date, badges)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Portfolio

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/v1/portfolio/summary` | `user_id` | Net worth + asset class breakdown |
| GET | `/api/v1/portfolio/holdings` | `user_id` | All holdings (MF, Equity, Deposits) |
| GET | `/api/v1/portfolio/allocation` | `user_id` | Allocation % for pie chart |

### Transactions

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/v1/transactions` | `user_id`, `asset_type`, `action`, `source`, `limit`, `offset` | Unified deduplicated transaction list |
| GET | `/api/v1/orders` | — | Order history (global, not per-user) |

### Analytics

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/v1/analytics/pnl` | `user_id` | Total invested / current value / gain / return % |
| GET | `/api/v1/analytics/monthly-investments` | `user_id` | Monthly BUY amounts (last 12 months) |
| GET | `/api/v1/analytics/transaction-types` | `user_id` | MF transaction type breakdown (SIP/Purchase/Switch/etc.) |
| GET | `/api/v1/analytics/sip-summary` | `user_id` | SIP schemes, monthly amount, installments |
| GET | `/api/v1/analytics/amc-exposure` | `user_id` | MF value grouped by fund house (AMC) |
| GET | `/api/v1/analytics/deposit-cashflow` | `user_id` | Credit vs Debit per deposit account |

### Users & Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List of all users (id, name, email) |
| GET | `/api/v1/deduplication/report` | Deduplication evidence (`user_id` param supported) |
| GET | `/api/v1/health` | Health check |

> All endpoints that accept `user_id` default to `"all"` when the parameter is omitted, returning aggregated data across all 7 users.

Full interactive docs available at `http://localhost:8000/docs` when running.

---

## Multi-User Support

The dataset contains **7 users** (assignment_user01 through assignment_user07), each with independent portfolios spanning mutual funds, equities, and deposit accounts.

The **user selector** in the top navigation bar lets you switch between:
- **All Users** (default) — aggregates all 7 portfolios into a combined view
- **Individual users** — filters every page and all analytics to that user only

When viewing "All Users", all API calls pass `user_id=all`. When a specific user is selected, all calls pass that user's ID. The selection is stored in React context (`UserContext`) so every page and component reacts to it automatically without prop drilling.

---

## Features

### Dashboard (`/`)
- **P&L Summary Row** — Total Invested / Current Value / Absolute Gain / Total Return %
- **Net Worth Card** — Gradient card with per-class (MF / Equity / Deposit) breakdown bars
- **Asset Allocation Chart** — Recharts donut chart with hover tooltips
- **Stats Row** — Holdings count / Transaction count / Accounts count
- **Holdings Spotlight** — Top 5 MF holdings + Top 5 Equity holdings, ranked by value with proportional bars
- **Monthly Investment Trend** — Bar chart of BUY amounts per month (last 12 months)
- **Transaction Type Breakdown** — Donut chart of SIP / Purchase / Switch / Lump Sum / Dividend Reinvest
- **SIP Analysis Widget** — Active SIP count, estimated monthly amount, total installments, scheme list
- **AMC Exposure Chart** — Horizontal bars showing MF value per fund house
- **Deposit Cash Flow** — Credit vs Debit per account with net cashflow and Surplus/Deficit badge
- **Recent Activity Feed** — Last 8 transactions across all sources in timeline style
- **Quick Links** — Cards linking to Holdings, Transactions, Deduplication pages

### Holdings (`/holdings`)
- Mutual Fund holdings table with **P&L columns** (Invested ₹ / Gain ₹ / Return %) — color-coded
- Equity holdings table
- Bank deposit accounts table
- Order history table
- Tab switcher to navigate between asset types

### Transactions (`/transactions`)
- Unified deduplicated transaction list across all three sources
- Filters: asset type, action (BUY/SELL), source
- Color-coded BUY (green) / SELL (red) action badges
- Pagination (50 per page)

### Deduplication Evidence (`/deduplication`)
- Stats bar: MF Central count, AA count, overlaps found, records removed, final count
- Strategy explanation (ISIN-based dedup + AA tie-break rule)
- Side-by-side field comparison table per overlapping ISIN

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

When an ISIN is found in both MF Central and AA, the AA record is used for current holdings value, units, and NAV. The MF Central record is flagged as a duplicate and excluded from net worth calculation.

**3. Multi-user ISIN aggregation**

In "All Users" mode, the same ISIN appears once per user in AA data (e.g. 7 entries for the same fund). The deduplication logic **sums** `current_value` across all user entries for the same ISIN before comparing against MF Central, preventing any single ISIN from being counted more than once in the final output.

**4. Transaction-level dedup**

For the unified transaction history, MF transactions are deduped using the composite key:
```
(isin, normalized_date, normalized_units)
```
If both sources report the same trade on the same day for the same units, only the AA record is kept.

**5. Net worth is safe from double-counting**

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

## P&L Calculation

Cost basis is derived from **MF Central BUY transaction amounts** (`trxnAmount` where `trxnSign == "+"`), summed per ISIN. This is used instead of the AA `costValue` field which carries `0.0` in the test dataset.

```
cost_value    = sum of all BUY amounts for that ISIN (from MF Central)
gain_loss     = current_value - cost_value
gain_loss_pct = (gain_loss / cost_value) × 100
```

These fields are attached to each `MFHolding` and surfaced both in the P&L Summary Row on the dashboard and in the Invested / Gain / Return columns of the MF holdings table.

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
