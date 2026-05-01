import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#8b5cf6']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { label, count, total_amount, percentage } = payload[0].payload
  return (
    <div className="glass-card rounded-xl px-4 py-3 border border-[#1e2a3a] shadow-xl">
      <p className="text-white font-semibold text-sm mb-1">{label}</p>
      <p className="text-slate-300 text-xs">{formatCurrency(total_amount)}</p>
      <p className="text-slate-500 text-xs">{count} transactions · {percentage}%</p>
    </div>
  )
}

export default function TransactionTypeChart({ data }) {
  if (!data?.length) return null

  // Use total_amount as the pie value
  const chartData = data.map((d) => ({ ...d, value: d.total_amount }))

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-1">Transaction Type Mix</h3>
      <p className="text-slate-500 text-xs mb-4">MF transactions by type &amp; amount</p>

      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
        {chartData.map((item, i) => (
          <div key={item.flag} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-slate-400 text-xs">{item.label}</span>
            <span className="text-slate-200 text-xs font-semibold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
