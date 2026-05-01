import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// ── Users ───────────────────────────────────────────────────────────────────

export const fetchUsers = () =>
  api.get('/users').then((r) => r.data)

// ── Portfolio ──────────────────────────────────────────────────────────────

export const fetchPortfolioSummary = (userId = 'all') =>
  api.get('/portfolio/summary', { params: { user_id: userId } }).then((r) => r.data)

export const fetchHoldings = (userId = 'all') =>
  api.get('/portfolio/holdings', { params: { user_id: userId } }).then((r) => r.data)

export const fetchAllocation = (userId = 'all') =>
  api.get('/portfolio/allocation', { params: { user_id: userId } }).then((r) => r.data)

// ── Transactions ───────────────────────────────────────────────────────────

export const fetchTransactions = (params = {}) =>
  api.get('/transactions', { params }).then((r) => r.data)

export const fetchOrders = () =>
  api.get('/orders').then((r) => r.data)

// ── Deduplication ──────────────────────────────────────────────────────────

export const fetchDeduplicationReport = (userId = 'all') =>
  api.get('/deduplication/report', { params: { user_id: userId } }).then((r) => r.data)

// ── Analytics ──────────────────────────────────────────────────────────────

export const fetchPnL = (userId = 'all') =>
  api.get('/analytics/pnl', { params: { user_id: userId } }).then((r) => r.data)

export const fetchMonthlyInvestments = (userId = 'all') =>
  api.get('/analytics/monthly-investments', { params: { user_id: userId } }).then((r) => r.data)

export const fetchTransactionTypes = (userId = 'all') =>
  api.get('/analytics/transaction-types', { params: { user_id: userId } }).then((r) => r.data)

export const fetchSIPSummary = (userId = 'all') =>
  api.get('/analytics/sip-summary', { params: { user_id: userId } }).then((r) => r.data)

export const fetchAMCExposure = (userId = 'all') =>
  api.get('/analytics/amc-exposure', { params: { user_id: userId } }).then((r) => r.data)

export const fetchDepositCashflow = (userId = 'all') =>
  api.get('/analytics/deposit-cashflow', { params: { user_id: userId } }).then((r) => r.data)

// ── Health ─────────────────────────────────────────────────────────────────

export const fetchHealth = () =>
  api.get('/health').then((r) => r.data)
