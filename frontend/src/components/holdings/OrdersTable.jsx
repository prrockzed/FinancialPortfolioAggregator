import { formatCurrency, formatDateTime, truncate } from '../../utils/formatters'

export default function OrdersTable({ orders }) {
  if (!orders?.length) return <p className="text-slate-500 text-sm py-8 text-center">No orders found.</p>

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left">Order ID</th>
            <th className="text-left">Scheme</th>
            <th className="text-left">ISIN</th>
            <th className="text-left">Investor UCC</th>
            <th className="text-right">Amount</th>
            <th className="text-center">Action</th>
            <th className="text-center">Status</th>
            <th className="text-left">Placed At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-mono text-xs text-slate-500">{o.id}</td>
              <td className="max-w-xs">
                <span className="text-slate-200" title={o.scheme_name}>{truncate(o.scheme_name, 40)}</span>
                <br />
                <span className="text-slate-500 text-xs">{o.scheme_code}</span>
              </td>
              <td>
                {o.isin
                  ? <span className="font-mono text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">{o.isin}</span>
                  : <span className="text-slate-600">—</span>
                }
              </td>
              <td className="text-slate-400 text-xs font-mono">{o.investor_ucc}</td>
              <td className="text-right font-semibold text-purple-400">{formatCurrency(o.amount)}</td>
              <td className="text-center">
                <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  {o.action}
                </span>
              </td>
              <td className="text-center">
                <span className={`badge border ${
                  o.status === 'matched'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                }`}>
                  {o.status}
                </span>
              </td>
              <td className="text-slate-400 text-xs">{formatDateTime(o.placed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
