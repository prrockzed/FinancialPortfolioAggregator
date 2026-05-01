import { formatNumber } from '../../utils/formatters'

export default function StatsRow({ summary }) {
  const stats = [
    {
      label: 'Total Holdings',
      value: formatNumber(summary.total_holdings_count, 0),
      icon: '◈',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Transactions',
      value: formatNumber(summary.total_transactions_count, 0),
      icon: '⇅',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Bank Accounts',
      value: formatNumber(summary.total_accounts_count, 0),
      icon: '⬡',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, icon, color, bg }) => (
        <div
          key={label}
          className="glass-card rounded-xl p-5 border border-[#1e2a3a] transition-card"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">{label}</p>
            <span className={`text-base ${color} ${bg} w-8 h-8 rounded-lg flex items-center justify-center`}>
              {icon}
            </span>
          </div>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
