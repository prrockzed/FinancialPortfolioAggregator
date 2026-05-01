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

// ── Health ─────────────────────────────────────────────────────────────────

export const fetchHealth = () =>
  api.get('/health').then((r) => r.data)
