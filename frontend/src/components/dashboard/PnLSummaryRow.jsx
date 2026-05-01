import { formatCurrency } from '../../utils/formatters'

export default function PnLSummaryRow({ pnl }) {
  if (!pnl) return null

  const isGain = pnl.gain_loss >= 0
  const gainColor = isGain ? 'text-emerald-400' : 'text-rose-400'
  const gainBg = isGain ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'

  const cards = [
    {
      label: 'Total Invested',
      value: formatCurrency(pnl.total_invested),
      sub: `${pnl.holdings_with_cost_data} of ${pnl.total_mf_holdings} MF holdings`,
      valueClass: 'text-slate-200',
      icon: '₹',
      iconBg: 'bg-slate-500/10 text-slate-400',
    },
    {
      label: 'Current Value',
      value: formatCurrency(pnl.current_value),
      sub: 'MF portfolio today',
      valueClass: 'text-indigo-400',
      icon: '◈',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      label: 'Absolute Gain',
      value: pnl.gain_loss != null ? `${isGain ? '+' : ''}${formatCurrency(pnl.gain_loss)}` : '—',
      sub: 'vs. invested cost basis',
      valueClass: gainColor,
      icon: isGain ? '▲' : '▼',
      iconBg: gainBg,
    },
    {
      label: 'Total Return',
      value: pnl.gain_loss_pct != null ? `${isGain ? '+' : ''}${pnl.gain_loss_pct.toFixed(2)}%` : '—',
      sub: 'overall MF return',
      valueClass: gainColor,
      icon: '%',
      iconBg: gainBg,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, valueClass, icon, iconBg }) => (
        <div key={label} className="glass-card rounded-xl p-4 border border-[#1e2a3a]">
          <div className="flex items-start justify-between mb-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
            <span className={`text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center border ${iconBg}`}>
              {icon}
            </span>
          </div>
          <p className={`text-xl font-bold font-mono ${valueClass}`}>{value}</p>
          <p className="text-slate-600 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}
