import { formatCurrency, truncate } from '../../utils/formatters'

function HoldingBar({ name, value, maxValue, color }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-300 text-xs truncate max-w-[60%]" title={name}>{truncate(name, 28)}</span>
        <span className="text-slate-200 text-xs font-semibold font-mono">{formatCurrency(value)}</span>
      </div>
      <div className="h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Top5Holdings({ holdings }) {
  if (!holdings) return null

  const topMF = [...holdings.mutual_funds]
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 5)

  const topEQ = [...holdings.equities]
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 5)

  const maxMF = topMF[0]?.current_value ?? 1
  const maxEQ = topEQ[0]?.current_value ?? 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top 5 Mutual Funds */}
      <div className="glass-card rounded-xl p-5 border border-[#1e2a3a]">
        <h3 className="text-white font-semibold text-sm mb-1">Top 5 Mutual Funds</h3>
        <p className="text-slate-500 text-xs mb-4">By current value</p>
        {topMF.length === 0 ? (
          <p className="text-slate-600 text-sm">No mutual fund holdings.</p>
        ) : (
          <div className="space-y-3">
            {topMF.map((h) => (
              <HoldingBar
                key={h.isin}
                name={h.scheme_name}
                value={h.current_value}
                maxValue={maxMF}
                color="#6366f1"
              />
            ))}
          </div>
        )}
      </div>

      {/* Top 5 Equities */}
      <div className="glass-card rounded-xl p-5 border border-[#1e2a3a]">
        <h3 className="text-white font-semibold text-sm mb-1">Top 5 Equities</h3>
        <p className="text-slate-500 text-xs mb-4">By current value</p>
        {topEQ.length === 0 ? (
          <p className="text-slate-600 text-sm">No equity holdings.</p>
        ) : (
          <div className="space-y-3">
            {topEQ.map((h) => (
              <HoldingBar
                key={h.isin}
                name={h.company_name}
                value={h.current_value}
                maxValue={maxEQ}
                color="#10b981"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
