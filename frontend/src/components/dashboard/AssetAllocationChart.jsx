import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const COLORS = ['#6366f1', '#10b981', '#f59e0b']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, percentage } = payload[0].payload
  return (
    <div className="glass-card rounded-xl px-4 py-3 border border-[#1e2a3a] shadow-xl">
      <p className="text-white font-semibold text-sm mb-1">{name}</p>
      <p className="text-slate-300 text-sm">{formatCurrency(value)}</p>
      <p className="text-slate-500 text-xs">{percentage}% of portfolio</p>
    </div>
  )
}

export default function AssetAllocationChart({ allocation }) {
  if (!allocation?.length) return null

  return (
    <div className="glass-card rounded-xl p-6 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-base mb-1">Asset Allocation</h3>
      <p className="text-slate-500 text-xs mb-4">Portfolio distribution by asset class</p>

      {/* Chart — takes full width, no side-by-side flex */}
      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
            >
              {allocation.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend — horizontal row below the chart */}
      <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
        {allocation.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-slate-400 text-xs">{item.name}</span>
            <span className="text-slate-200 text-xs font-semibold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
