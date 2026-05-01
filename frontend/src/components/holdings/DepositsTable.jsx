import { formatCurrency, formatDate } from '../../utils/formatters'

export default function DepositsTable({ accounts }) {
  if (!accounts?.length) return <p className="text-slate-500 text-sm py-8 text-center">No deposit accounts found.</p>

  const total = accounts.reduce((s, a) => s + a.current_balance, 0)

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left">Account Number</th>
            <th className="text-left">Bank</th>
            <th className="text-center">Type</th>
            <th className="text-center">Status</th>
            <th className="text-left">Opened</th>
            <th className="text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.account_ref}>
              <td>
                <span className="font-mono text-sm text-slate-300">{a.masked_account_number}</span>
              </td>
              <td className="text-slate-300 text-sm">{a.bank_name}</td>
              <td className="text-center">
                <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  {a.account_type}
                </span>
              </td>
              <td className="text-center">
                <span className={`badge border ${
                  a.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                }`}>
                  {a.status}
                </span>
              </td>
              <td className="text-slate-400 text-sm">{formatDate(a.opening_date)}</td>
              <td className="text-right font-semibold text-amber-400">{formatCurrency(a.current_balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right text-slate-500 text-xs pt-4 border-t border-[#1e2a3a]">
              Total ({accounts.length} accounts)
            </td>
            <td className="text-right font-bold text-white pt-4 border-t border-[#1e2a3a]">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
