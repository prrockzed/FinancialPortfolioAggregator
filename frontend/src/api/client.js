import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

// ── Portfolio ──────────────────────────────────────────────────────────────

export const fetchPortfolioSummary = () =>
  api.get('/portfolio/summary').then((r) => r.data)

export const fetchHoldings = () =>
  api.get('/portfolio/holdings').then((r) => r.data)

export const fetchAllocation = () =>
  api.get('/portfolio/allocation').then((r) => r.data)

// ── Transactions ───────────────────────────────────────────────────────────

export const fetchTransactions = (params = {}) =>
  api.get('/transactions', { params }).then((r) => r.data)

export const fetchOrders = () =>
  api.get('/orders').then((r) => r.data)

// ── Deduplication ──────────────────────────────────────────────────────────

export const fetchDeduplicationReport = () =>
  api.get('/deduplication/report').then((r) => r.data)

// ── Health ─────────────────────────────────────────────────────────────────

export const fetchHealth = () =>
  api.get('/health').then((r) => r.data)
