import { useEffect, useState } from 'react'
import {
  fetchPortfolioSummary,
  fetchHoldings,
  fetchTransactions,
  fetchPnL,
  fetchMonthlyInvestments,
  fetchTransactionTypes,
  fetchSIPSummary,
  fetchAMCExposure,
  fetchDepositCashflow,
} from '../api/client'
import { useUser } from '../context/UserContext'

import NetWorthCard          from '../components/dashboard/NetWorthCard'
import AssetAllocationChart  from '../components/dashboard/AssetAllocationChart'
import StatsRow              from '../components/dashboard/StatsRow'
import PnLSummaryRow         from '../components/dashboard/PnLSummaryRow'
import Top5Holdings          from '../components/dashboard/Top5Holdings'
import MonthlyInvestmentChart from '../components/dashboard/MonthlyInvestmentChart'
import TransactionTypeChart  from '../components/dashboard/TransactionTypeChart'
import SIPAnalysisWidget     from '../components/dashboard/SIPAnalysisWidget'
import AMCExposureChart      from '../components/dashboard/AMCExposureChart'
import DepositCashFlow       from '../components/dashboard/DepositCashFlow'
import RecentActivityFeed    from '../components/dashboard/RecentActivityFeed'
import Spinner               from '../components/common/Spinner'
import ErrorMessage          from '../components/common/ErrorMessage'

export default function DashboardPage() {
  const { selectedUserId } = useUser()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      fetchPortfolioSummary(selectedUserId),
      fetchHoldings(selectedUserId),
      fetchPnL(selectedUserId),
      fetchMonthlyInvestments(selectedUserId),
      fetchTransactionTypes(selectedUserId),
      fetchSIPSummary(selectedUserId),
      fetchAMCExposure(selectedUserId),
      fetchDepositCashflow(selectedUserId),
      fetchTransactions({ user_id: selectedUserId, limit: 8 }),
    ])
      .then(([summary, holdings, pnl, monthly, txnTypes, sip, amc, cashflow, recentTxns]) => {
        setData({ summary, holdings, pnl, monthly, txnTypes, sip, amc, cashflow, recentTxns })
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [selectedUserId])

  if (loading) return <Spinner text="Aggregating portfolio…" />
  if (error)   return <ErrorMessage message={error} />

  const { summary, holdings, pnl, monthly, txnTypes, sip, amc, cashflow, recentTxns } = data

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Portfolio Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Aggregated across Orders, MF Central &amp; Account Aggregator — deduplicated.
        </p>
      </div>

      {/* P&L Summary Row */}
      <PnLSummaryRow pnl={pnl} />

      {/* Net Worth + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetWorthCard
            netWorth={summary.net_worth}
            investorName={summary.investor_name}
            investorEmail={summary.investor_email}
          />
        </div>
        <div>
          <AssetAllocationChart allocation={summary.allocation} />
        </div>
      </div>

      {/* Stats row */}
      <StatsRow summary={summary} />

      {/* Top 5 Holdings */}
      <div>
        <SectionLabel>Holdings Spotlight</SectionLabel>
        <Top5Holdings holdings={holdings} />
      </div>

      {/* Monthly Trend + Transaction Type */}
      <div>
        <SectionLabel>Investment Analytics</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyInvestmentChart data={monthly} />
          </div>
          <div>
            <TransactionTypeChart data={txnTypes} />
          </div>
        </div>
      </div>

      {/* SIP + AMC Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SIPAnalysisWidget sip={sip} />
        <AMCExposureChart data={amc} />
      </div>

      {/* Deposit Cash Flow + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <DepositCashFlow data={cashflow} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityFeed transactions={recentTxns} />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink to="/holdings"      title="View Holdings"          desc="Full positions broken down by asset class." icon="◈" color="indigo" />
        <QuickLink to="/transactions"  title="Transaction History"    desc="Unified, deduplicated list across all sources." icon="⇅" color="cyan" />
        <QuickLink to="/deduplication" title="Deduplication Evidence" desc="Which records overlapped and how they were merged." icon="⊕" color="emerald" />
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-3">{children}</p>
  )
}

function QuickLink({ to, title, desc, icon, color }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'hover:border-indigo-500/40' },
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'hover:border-cyan-500/40' },
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
