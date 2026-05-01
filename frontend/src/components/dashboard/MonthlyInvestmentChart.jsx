import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-4 py-3 border border-[#1e2a3a] shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-indigo-400 font-bold text-sm">
        ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

function formatMonth(m) {
  const [year, month] = m.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(month, 10) - 1]} '${year.slice(2)}`
}

export default function MonthlyInvestmentChart({ data }) {
  if (!data?.length) return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex items-center justify-center">
      <p className="text-slate-600 text-sm">No investment data available.</p>
    </div>
  )

  const maxVal = Math.max(...data.map((d) => d.amount))

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-1">Monthly Investment Trend</h3>
      <p className="text-slate-500 text-xs mb-4">MF BUY amounts per month (last 12 months)</p>
      <div className="flex-1" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.amount === maxVal ? '#6366f1' : '#334155'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
