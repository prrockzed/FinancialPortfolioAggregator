import { formatCurrency, formatNumber, truncate } from '../../utils/formatters'

export default function MutualFundsTable({ holdings }) {
  if (!holdings?.length) return <p className="text-slate-500 text-sm py-8 text-center">No mutual fund holdings found.</p>

  const total = holdings.reduce((s, h) => s + h.current_value, 0)

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left">ISIN</th>
            <th className="text-left">Scheme</th>
            <th className="text-left">AMC</th>
            <th className="text-right">Units</th>
            <th className="text-right">NAV</th>
            <th className="text-right">Invested</th>
            <th className="text-right">Current Value</th>
            <th className="text-right">Gain / Loss</th>
            <th className="text-right">Return %</th>
            <th className="text-center">Source</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const hasGL = h.gain_loss != null
            const isGain = hasGL && h.gain_loss >= 0
            const glColor = isGain ? 'text-emerald-400' : 'text-rose-400'

            return (
              <tr key={h.isin}>
                <td>
                  <span className="font-mono text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                    {h.isin}
                  </span>
                </td>
                <td className="max-w-xs">
                  <span className="text-slate-200" title={h.scheme_name}>{truncate(h.scheme_name, 36)}</span>
                </td>
                <td className="text-slate-400 text-xs">{h.amc || '—'}</td>
                <td className="text-right text-slate-300 font-mono text-sm">{formatNumber(h.units)}</td>
                <td className="text-right text-slate-300 font-mono text-sm">{h.nav ? formatCurrency(h.nav) : '—'}</td>
                <td className="text-right text-slate-400 font-mono text-sm">
                  {h.cost_value != null ? formatCurrency(h.cost_value) : '—'}
                </td>
                <td className="text-right font-semibold text-indigo-400">{formatCurrency(h.current_value)}</td>
                <td className={`text-right font-semibold text-sm ${hasGL ? glColor : 'text-slate-600'}`}>
                  {hasGL ? `${isGain ? '+' : ''}${formatCurrency(h.gain_loss)}` : '—'}
                </td>
                <td className={`text-right font-semibold text-sm ${hasGL ? glColor : 'text-slate-600'}`}>
                  {h.gain_loss_pct != null ? `${isGain ? '+' : ''}${h.gain_loss_pct.toFixed(2)}%` : '—'}
                </td>
                <td className="text-center">
                  <span className={`badge border ${
                    h.source === 'aa'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                  }`}>
                    {h.source === 'aa' ? 'AA' : 'MF Central'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="text-right text-slate-500 text-xs pt-4 border-t border-[#1e2a3a]">
              Total ({holdings.length} funds)
            </td>
            <td className="text-right font-bold text-white pt-4 border-t border-[#1e2a3a]">
              {formatCurrency(total)}
            </td>
            <td colSpan={3} className="border-t border-[#1e2a3a]" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
