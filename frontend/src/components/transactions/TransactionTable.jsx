import { useState, useEffect, useCallback } from 'react'
import { fetchTransactions } from '../../api/client'
import { formatCurrency, formatDate, formatNumber, truncate, getActionStyle, getSourceStyle, getAssetTypeStyle } from '../../utils/formatters'
import Spinner from '../common/Spinner'
import ErrorMessage from '../common/ErrorMessage'

const ASSET_TYPES = ['', 'deposit', 'equities', 'mutual_fund', 'order']
const ACTIONS     = ['', 'BUY', 'SELL']
const SOURCES     = ['', 'aa', 'mf_central', 'order']

const SelectFilter = ({ label, value, onChange, options, labelMap = {} }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#111827] border border-[#1e2a3a] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50 transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o === '' ? 'All' : (labelMap[o] ?? o)}</option>
      ))}
    </select>
  </div>
)

export default function TransactionTable() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const [assetType, setAssetType] = useState('')
  const [action, setAction]       = useState('')
  const [source, setSource]       = useState('')
  const [page, setPage]           = useState(1)

  const LIMIT = 50

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, limit: LIMIT }
    if (assetType) params.asset_type = assetType
    if (action)    params.action     = action
    if (source)    params.source     = source

    fetchTransactions(params)
      .then(setTransactions)
      .catch(() => setError('Failed to load transactions.'))
      .finally(() => setLoading(false))
  }, [assetType, action, source, page])

  useEffect(() => { load() }, [load])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [assetType, action, source])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card rounded-xl p-4 border border-[#1e2a3a]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <SelectFilter
            label="Asset Type"
            value={assetType}
            onChange={setAssetType}
            options={ASSET_TYPES}
            labelMap={{ mutual_fund: 'Mutual Fund', equities: 'Equity', deposit: 'Deposit', order: 'Order' }}
          />
          <SelectFilter label="Action" value={action} onChange={setAction} options={ACTIONS} />
          <SelectFilter
            label="Source"
            value={source}
            onChange={setSource}
            options={SOURCES}
            labelMap={{ aa: 'Account Aggregator', mf_central: 'MF Central', order: 'Order' }}
          />
          <div className="flex items-end">
            <button
              onClick={() => { setAssetType(''); setAction(''); setSource(''); setPage(1) }}
              className="w-full py-2 px-3 rounded-lg text-sm text-slate-400 border border-[#1e2a3a] hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner text="Loading transactions…" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="glass-card rounded-xl border border-[#1e2a3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-left">Description</th>
                  <th className="text-center">Asset Type</th>
                  <th className="text-center">Action</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">NAV / Price</th>
                  <th className="text-center">Source</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-500 py-12">No transactions match the selected filters.</td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const action  = getActionStyle(t.action)
                    const src     = getSourceStyle(t.source)
                    const assetSt = getAssetTypeStyle(t.asset_type)
                    return (
                      <tr key={t.id}>
                        <td className="text-slate-400 text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="max-w-xs">
                          <span className="text-slate-300" title={t.description}>{truncate(t.description, 45)}</span>
                          {t.isin && (
                            <span className="block font-mono text-[10px] text-slate-600 mt-0.5">{t.isin}</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${assetSt.bg} ${assetSt.text}`}>{assetSt.label}</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge border ${action.bg} ${action.text} ${action.border}`}>
                            {t.action}
                          </span>
                        </td>
                        <td className="text-right text-slate-300 text-sm font-mono">
                          {t.amount ? formatCurrency(t.amount) : '—'}
                        </td>
                        <td className="text-right text-slate-400 text-sm font-mono">
                          {t.units != null && t.units !== 0 ? formatNumber(t.units) : '—'}
                        </td>
                        <td className="text-right text-slate-400 text-sm font-mono">
                          {t.nav_or_price ? formatCurrency(t.nav_or_price) : '—'}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${src.bg} ${src.text}`}>{src.label}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2a3a]">
            <p className="text-slate-500 text-xs">
              Page {page} · {transactions.length} records shown
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#1e2a3a] text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={transactions.length < LIMIT}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#1e2a3a] text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
