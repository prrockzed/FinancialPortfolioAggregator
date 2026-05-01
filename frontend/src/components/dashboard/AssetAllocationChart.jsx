import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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

const CustomLegend = ({ payload }) => (
  <ul className="flex flex-col gap-2.5 mt-2">
    {payload.map((entry) => (
      <li key={entry.value} className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-400 text-sm">{entry.value}</span>
        <span className="ml-auto text-slate-300 text-sm font-medium">
          {entry.payload.percentage}%
        </span>
      </li>
    ))}
  </ul>
)

export default function AssetAllocationChart({ allocation }) {
  if (!allocation?.length) return null

  return (
    <div className="glass-card rounded-xl p-6 border border-[#1e2a3a]">
      <h3 className="text-white font-semibold text-base mb-1">Asset Allocation</h3>
      <p className="text-slate-500 text-xs mb-6">Portfolio distribution by asset class</p>

      <div className="flex items-center gap-6">
        <div className="flex-1" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {allocation.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={0.85}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-44 flex-shrink-0">
          <CustomLegend
            payload={allocation.map((a, i) => ({
              value: a.name,
              color: COLORS[i % COLORS.length],
              payload: a,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
