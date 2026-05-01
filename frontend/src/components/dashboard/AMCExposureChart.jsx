import { formatCurrency } from '../../utils/formatters'

export default function AMCExposureChart({ data }) {
  if (!data?.length) return null

  const maxVal = data[0]?.total_value ?? 1

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-1">AMC Exposure</h3>
      <p className="text-slate-500 text-xs mb-4">Fund house concentration by current value</p>

      <div className="space-y-3 flex-1">
        {data.map((item, i) => {
          const barPct = maxVal > 0 ? (item.total_value / maxVal) * 100 : 0
          const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#8b5cf6']
          const color = colors[i % colors.length]
          return (
            <div key={item.amc}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 text-xs font-medium">{item.amc}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">{item.percentage}%</span>
                  <span className="text-slate-200 text-xs font-semibold font-mono">{formatCurrency(item.total_value)}</span>
                </div>
              </div>
              <div className="h-2 bg-[#1e2a3a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${barPct}%`, backgroundColor: color, opacity: 0.8 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
