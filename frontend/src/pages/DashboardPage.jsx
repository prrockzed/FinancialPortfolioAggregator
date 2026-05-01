import { useEffect, useState } from 'react'
import { fetchPortfolioSummary } from '../api/client'
import { useUser } from '../context/UserContext'
import NetWorthCard from '../components/dashboard/NetWorthCard'
import AssetAllocationChart from '../components/dashboard/AssetAllocationChart'
import StatsRow from '../components/dashboard/StatsRow'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function DashboardPage() {
  const { selectedUserId } = useUser()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchPortfolioSummary(selectedUserId)
      .then(setSummary)
      .catch(() => setError('Failed to load portfolio summary.'))
      .finally(() => setLoading(false))
  }, [selectedUserId])

  if (loading) return <Spinner text="Aggregating portfolio…" />
  if (error)   return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Portfolio Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Aggregated across Orders, MF Central &amp; Account Aggregator — deduplicated.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Worth — spans 2 cols */}
        <div className="lg:col-span-2">
          <NetWorthCard
            netWorth={summary.net_worth}
            investorName={summary.investor_name}
            investorEmail={summary.investor_email}
          />
        </div>

        {/* Allocation chart */}
        <div>
          <AssetAllocationChart allocation={summary.allocation} />
        </div>
      </div>

      {/* Stats row */}
      <StatsRow summary={summary} />

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickLink
          to="/holdings"
          title="View Holdings"
          desc="Mutual funds, equities, deposits &amp; orders broken down by asset class."
          icon="◈"
          color="indigo"
        />
        <QuickLink
          to="/transactions"
          title="Transaction History"
          desc="Unified, deduplicated list of all transactions across every source."
          icon="⇅"
          color="cyan"
        />
        <QuickLink
          to="/deduplication"
          title="Deduplication Evidence"
          desc="See exactly which records overlapped and how they were merged."
          icon="⊕"
          color="emerald"
        />
      </div>
    </div>
  )
}

function QuickLink({ to, title, desc, icon, color }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'hover:border-indigo-500/40' },
    cyan:    { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'hover:border-cyan-500/40' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'hover:border-emerald-500/40' },
  }
  const c = colorMap[color]

  return (
    <a
      href={to}
      className={`glass-card rounded-xl p-5 border border-[#1e2a3a] ${c.border} transition-card flex items-start gap-4 group cursor-pointer no-underline`}
    >
      <span className={`text-xl ${c.text} ${c.bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </span>
      <div>
        <p className={`font-semibold text-sm ${c.text} group-hover:underline`}>{title}</p>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
    </a>
  )
}
