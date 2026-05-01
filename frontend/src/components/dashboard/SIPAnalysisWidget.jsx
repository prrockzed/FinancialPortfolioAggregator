import { formatCurrency, truncate } from '../../utils/formatters'

export default function SIPAnalysisWidget({ sip }) {
  if (!sip) return null

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] h-full flex flex-col">
      <h3 className="text-white font-semibold text-sm mb-1">SIP Analysis</h3>
      <p className="text-slate-500 text-xs mb-4">Systematic investment plan tracker</p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-400">{sip.active_schemes}</p>
          <p className="text-slate-500 text-xs mt-1">Active SIPs</p>
        </div>
        <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(sip.estimated_monthly_sip)}</p>
          <p className="text-slate-500 text-xs mt-1">Est. Monthly</p>
        </div>
        <div className="bg-amber-500/8 border border-amber-500/15 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{sip.total_installments}</p>
          <p className="text-slate-500 text-xs mt-1">Installments</p>
        </div>
      </div>

      {/* Scheme list */}
      <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">SIP Schemes</p>
      <div className="space-y-2 flex-1">
        {sip.schemes.map((s) => (
          <div key={s.isin} className="flex items-center justify-between py-1.5 border-b border-[#1e2a3a] last:border-0">
            <div>
              <p className="text-slate-300 text-xs" title={s.name}>{truncate(s.name, 36)}</p>
              <p className="text-slate-600 text-[10px] mt-0.5">{s.installments} installments</p>
            </div>
            <span className="text-indigo-400 text-xs font-semibold font-mono flex-shrink-0 ml-3">
              {formatCurrency(s.monthly_amount)}/mo
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
