import { formatCurrency, formatNumber } from '../../utils/formatters'

export default function NetWorthCard({ netWorth, investorName, investorEmail }) {
  const items = [
    { label: 'Mutual Funds', value: netWorth.mutual_funds, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { label: 'Equities',     value: netWorth.equities,     color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { label: 'Deposits',     value: netWorth.deposits,     color: 'text-amber-400',   bar: 'bg-amber-500' },
  ]

  return (
    <div className="gradient-border p-[1px]">
      <div className="glass-card rounded-xl p-8">
        {/* Investor info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Portfolio Owner</p>
            <p className="text-white font-semibold text-lg">{investorName || 'Investor'}</p>
            <p className="text-slate-500 text-sm">{investorEmail}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            {(investorName || 'I')[0].toUpperCase()}
          </div>
        </div>

        {/* Net Worth figure */}
        <div className="mb-8">
          <p className="text-slate-500 text-sm mb-2">Total Portfolio Value</p>
          <p className="gradient-text text-5xl font-bold tracking-tight">
            {formatCurrency(netWorth.total)}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-4">
          {items.map(({ label, value, color, bar }) => {
            const pct = netWorth.total > 0 ? (value / netWorth.total) * 100 : 0
            return (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{pct.toFixed(1)}%</span>
                    <span className={`font-semibold text-sm ${color}`}>{formatCurrency(value)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar} transition-all duration-700`}
                    style={{ width: `${pct}%`, opacity: 0.7 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
