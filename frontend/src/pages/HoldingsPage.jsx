import { useEffect, useState } from 'react'
import { fetchHoldings, fetchOrders } from '../api/client'
import MutualFundsTable from '../components/holdings/MutualFundsTable'
import EquitiesTable    from '../components/holdings/EquitiesTable'
import DepositsTable    from '../components/holdings/DepositsTable'
import OrdersTable      from '../components/holdings/OrdersTable'
import Spinner          from '../components/common/Spinner'
import ErrorMessage     from '../components/common/ErrorMessage'
import { formatCurrency } from '../utils/formatters'

const TABS = [
  { id: 'mf',       label: 'Mutual Funds', color: 'indigo' },
  { id: 'equities', label: 'Equities',     color: 'emerald' },
  { id: 'deposits', label: 'Deposits',     color: 'amber' },
  { id: 'orders',   label: 'Orders',       color: 'purple' },
]

const colorMap = {
  indigo:  { active: 'border-indigo-500 text-indigo-400',  dot: 'bg-indigo-500' },
  emerald: { active: 'border-emerald-500 text-emerald-400', dot: 'bg-emerald-500' },
  amber:   { active: 'border-amber-500 text-amber-400',    dot: 'bg-amber-500' },
  purple:  { active: 'border-purple-500 text-purple-400',  dot: 'bg-purple-500' },
}

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState(null)
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [tab,      setTab]      = useState('mf')

  useEffect(() => {
    Promise.all([fetchHoldings(), fetchOrders()])
      .then(([h, o]) => { setHoldings(h); setOrders(o) })
      .catch(() => setError('Failed to load holdings.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading holdings…" />
  if (error)   return <ErrorMessage message={error} />

  const mfTotal  = holdings.mutual_funds.reduce((s, h) => s + h.current_value, 0)
  const eqTotal  = holdings.equities.reduce((s, h) => s + h.current_value, 0)
  const depTotal = holdings.deposits.reduce((s, a) => s + a.current_balance, 0)
  const ordTotal = orders.reduce((s, o) => s + o.amount, 0)

  const counts = {
    mf:       `${holdings.mutual_funds.length} funds · ${formatCurrency(mfTotal)}`,
    equities: `${holdings.equities.length} stocks · ${formatCurrency(eqTotal)}`,
    deposits: `${holdings.deposits.length} accounts · ${formatCurrency(depTotal)}`,
    orders:   `${orders.length} orders · ${formatCurrency(ordTotal)}`,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Holdings</h1>
        <p className="text-slate-500 text-sm mt-1">All positions deduplicated across MF Central &amp; Account Aggregator.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#1e2a3a]">
        {TABS.map(({ id, label, color }) => {
          const isActive = tab === id
          const c = colorMap[color]
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                isActive
                  ? `${c.active} border-b-2`
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
              {label}
              <span className={`text-xs ${isActive ? 'opacity-70' : 'opacity-40'}`}>
                ({tab === id ? counts[id].split('·')[0].trim() : (
                  id === 'mf' ? holdings.mutual_funds.length
                  : id === 'equities' ? holdings.equities.length
                  : id === 'deposits' ? holdings.deposits.length
                  : orders.length
                )})
              </span>
            </button>
          )
        })}
      </div>

      {/* Sub-summary */}
      <div className="text-slate-400 text-sm">{counts[tab]}</div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-[#1e2a3a] overflow-hidden p-1">
        {tab === 'mf'       && <MutualFundsTable holdings={holdings.mutual_funds} />}
        {tab === 'equities' && <EquitiesTable    holdings={holdings.equities} />}
        {tab === 'deposits' && <DepositsTable    accounts={holdings.deposits} />}
        {tab === 'orders'   && <OrdersTable      orders={orders} />}
      </div>
    </div>
  )
}
