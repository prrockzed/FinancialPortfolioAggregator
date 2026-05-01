import { formatCurrency, formatDate, truncate, getActionStyle, getSourceStyle } from '../../utils/formatters'

export default function RecentActivityFeed({ transactions }) {
  if (!transactions?.length) return null

  return (
    <div className="glass-card rounded-xl p-5 border border-[#1e2a3a]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
          <p className="text-slate-500 text-xs mt-0.5">Last {transactions.length} transactions across all sources</p>
        </div>
        <a href="/transactions" className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
          View all →
        </a>
      </div>

      <div className="space-y-0">
        {transactions.map((t, idx) => {
          const action = getActionStyle(t.action)
          const src    = getSourceStyle(t.source)
          return (
            <div
              key={t.id}
              className={`flex items-center gap-4 py-3 ${idx < transactions.length - 1 ? 'border-b border-[#1e2a3a]' : ''}`}
            >
              {/* Action badge */}
              <span className={`badge border text-[10px] w-12 justify-center flex-shrink-0 ${action.bg} ${action.text} ${action.border}`}>
                {t.action}
              </span>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-xs truncate" title={t.description}>
                  {truncate(t.description, 40)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-600 text-[10px]">{formatDate(t.date)}</span>
                  <span className={`badge text-[9px] ${src.bg} ${src.text}`}>{src.label}</span>
                </div>
              </div>

              {/* Amount */}
              {t.amount ? (
                <span className="text-slate-200 text-xs font-semibold font-mono flex-shrink-0">
                  {formatCurrency(t.amount)}
                </span>
              ) : (
                <span className="text-slate-600 text-xs flex-shrink-0">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
