import { formatCurrency } from '../../utils/formatters'

export default function DepositCashFlow({ data }) {
  if (!data) return null

  const isPositive = data.net_cashflow >= 0
  const netColor = isPositive ? 'text-emerald-400' : 'text-rose-400'

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-1">Deposit Cash Flow</h3>
      <p className="text-slate-500 text-xs mb-4">
        Bank account credits vs debits · {data.total_transactions} transactions
      </p>

      {/* Credit vs Debit bars */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-emerald-400 text-xs font-medium">Credits (money in)</span>
            <span className="text-emerald-400 text-xs font-semibold font-mono">{formatCurrency(data.total_credit)}</span>
          </div>
          <div className="h-2.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: '100%' }} />
          </div>
          <p className="text-slate-600 text-[10px] mt-0.5">{data.credit_count} transactions</p>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-rose-400 text-xs font-medium">Debits (money out)</span>
            <span className="text-rose-400 text-xs font-semibold font-mono">{formatCurrency(data.total_debit)}</span>
          </div>
          <div className="h-2.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500/70 rounded-full"
              style={{ width: `${data.total_credit > 0 ? (data.total_debit / data.total_credit) * 100 : 0}%` }}
            />
          </div>
          <p className="text-slate-600 text-[10px] mt-0.5">{data.debit_count} transactions</p>
        </div>
      </div>

      {/* Net */}
      <div className="mt-auto border-t border-[#1e2a3a] pt-4 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Net Cash Flow</p>
          <p className={`text-xl font-bold font-mono mt-1 ${netColor}`}>
            {isPositive ? '+' : ''}{formatCurrency(data.net_cashflow)}
          </p>
        </div>
        <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
        }`}>
          {isPositive ? 'Surplus' : 'Deficit'}
        </div>
      </div>
    </div>
  )
}
