import { formatCurrency, formatNumber, truncate } from '../../utils/formatters'

export default function EquitiesTable({ holdings }) {
  if (!holdings?.length) return <p className="text-slate-500 text-sm py-8 text-center">No equity holdings found.</p>

  const total = holdings.reduce((s, h) => s + h.current_value, 0)

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left">ISIN</th>
            <th className="text-left">Company</th>
            <th className="text-right">Units</th>
            <th className="text-right">LTP</th>
            <th className="text-right">Current Value</th>
            <th className="text-right">% of Equity</th>
          </tr>
        </thead>
        <tbody>
          {holdings
            .slice()
            .sort((a, b) => b.current_value - a.current_value)
            .map((h) => {
              const pct = total > 0 ? ((h.current_value / total) * 100).toFixed(1) : '0.0'
              return (
                <tr key={h.isin}>
                  <td>
                    <span className="font-mono text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      {h.isin}
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-200" title={h.company_name}>
                      {truncate(h.company_name, 38)}
                    </span>
                  </td>
                  <td className="text-right text-slate-300 font-mono text-sm">{formatNumber(h.units, 0)}</td>
                  <td className="text-right text-slate-300 font-mono text-sm">{formatCurrency(h.last_traded_price)}</td>
                  <td className="text-right font-semibold text-emerald-400">{formatCurrency(h.current_value)}</td>
                  <td className="text-right text-slate-500 text-xs">{pct}%</td>
                </tr>
              )
            })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-right text-slate-500 text-xs pt-4 border-t border-[#1e2a3a]">
              Total ({holdings.length} stocks)
            </td>
            <td className="text-right font-bold text-white pt-4 border-t border-[#1e2a3a]">
              {formatCurrency(total)}
            </td>
            <td className="border-t border-[#1e2a3a]" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
