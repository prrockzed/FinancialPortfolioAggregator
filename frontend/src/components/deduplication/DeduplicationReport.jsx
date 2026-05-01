import { formatCurrency, formatNumber } from '../../utils/formatters'

const StatCard = ({ label, value, color, sub }) => (
  <div className="glass-card rounded-xl p-5 border border-[#1e2a3a] text-center">
    <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
  </div>
)

const FieldRow = ({ label, mfc, aa, differs }) => (
  <tr className={differs ? 'bg-rose-500/5' : ''}>
    <td className="py-2 px-3 text-slate-500 text-xs font-semibold uppercase tracking-wider w-28">{label}</td>
    <td className={`py-2 px-3 text-sm font-mono ${differs ? 'text-rose-300' : 'text-slate-300'}`}>{mfc ?? '—'}</td>
    <td className={`py-2 px-3 text-sm font-mono ${differs ? 'text-emerald-300' : 'text-slate-300'}`}>{aa ?? '—'}</td>
    <td className="py-2 px-3 text-center">
      {differs
        ? <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">AA wins</span>
        : <span className="text-slate-600 text-xs">same</span>
      }
    </td>
  </tr>
)

export default function DeduplicationReport({ report }) {
  if (!report) return null

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="MF Central Records" value={report.total_mf_central_records} color="text-cyan-400" />
        <StatCard label="AA MF Records" value={report.total_aa_mf_records} color="text-indigo-400" />
        <StatCard label="Overlapping ISINs" value={report.overlapping_isins} color="text-rose-400" sub="found in both sources" />
        <StatCard label="Records Removed" value={report.records_removed} color="text-amber-400" sub="duplicates eliminated" />
        <StatCard label="Final Holdings" value={report.records_after_dedup} color="text-emerald-400" sub="after deduplication" />
      </div>

      {/* Strategy callout */}
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="text-indigo-400 text-xl mt-0.5">⊕</span>
          <div>
            <p className="text-indigo-300 font-semibold text-sm mb-1">Deduplication Strategy</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mutual fund holdings are identified across sources using <span className="text-white font-mono bg-slate-800/60 px-1.5 py-0.5 rounded text-xs">ISIN</span> as the primary key —
              a globally unique security identifier. When the same ISIN appears in both <span className="text-cyan-400">MF Central</span> and the{' '}
              <span className="text-indigo-400">Account Aggregator</span>, the <strong className="text-white">AA data takes precedence</strong> (tie-break rule).
              The MF Central record is excluded from net worth calculation, ensuring no double-counting.
            </p>
          </div>
        </div>
      </div>

      {/* Per-ISIN detail */}
      {report.entries.length === 0 ? (
        <div className="glass-card rounded-xl p-8 border border-[#1e2a3a] text-center">
          <p className="text-slate-500">No overlapping ISINs were found between sources.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-white font-semibold text-base">
            Overlapping Records — Side by Side
          </h3>
          {report.entries.map((entry) => {
            const mfc = entry.mf_central_record
            const aa  = entry.aa_record
            return (
              <div key={entry.isin} className="glass-card rounded-xl border border-[#1e2a3a] overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#1e2a3a] bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded mr-3">
                      {entry.isin}
                    </span>
                    <span className="text-white font-semibold text-sm">{entry.scheme_name}</span>
                  </div>
                  <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    ✓ Deduplicated — AA wins
                  </span>
                </div>

                {/* Comparison table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1e2a3a]/40">
                        <th className="py-2.5 px-3 text-left text-xs text-slate-600 uppercase tracking-wider w-28">Field</th>
                        <th className="py-2.5 px-3 text-left text-xs text-cyan-600 uppercase tracking-wider">
                          MF Central (excluded)
                        </th>
                        <th className="py-2.5 px-3 text-left text-xs text-indigo-400 uppercase tracking-wider">
                          Account Aggregator (winner)
                        </th>
                        <th className="py-2.5 px-3 text-center text-xs text-slate-600 uppercase tracking-wider">Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2a3a]/60">
                      <FieldRow label="AMC"    mfc={mfc.amc}         aa={aa.amc}          differs={mfc.amc !== aa.amc} />
                      <FieldRow label="Units"  mfc={mfc.units}       aa={aa.units}         differs={String(mfc.units) !== String(aa.units)} />
                      <FieldRow label="NAV"    mfc={mfc.nav ? formatCurrency(mfc.nav) : '—'} aa={aa.nav ? formatCurrency(aa.nav) : '—'} differs={mfc.nav !== aa.nav} />
                      <FieldRow label="Value"  mfc={formatCurrency(mfc.current_value)} aa={formatCurrency(aa.current_value)} differs={mfc.current_value !== aa.current_value} />
                      <FieldRow label="Folio"  mfc={mfc.folio || '—'} aa={aa.folio || '—'} differs={false} />
                      <FieldRow label="Source" mfc={mfc.source}      aa={aa.source}        differs={false} />
                    </tbody>
                  </table>
                </div>

                {/* Reason */}
                <div className="px-5 py-3 border-t border-[#1e2a3a] bg-white/[0.01]">
                  <p className="text-slate-500 text-xs">{entry.reason}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
