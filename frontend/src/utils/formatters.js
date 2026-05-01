/**
 * Format a number as Indian rupee currency (e.g. ₹12,34,567.89)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number with commas (Indian style, no currency symbol)
 */
export const formatNumber = (value, decimals = 3) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Format an ISO date string (e.g. "2025-12-18") to readable form
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Format an ISO datetime string (e.g. "2026-04-05T21:10:00Z")
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

/**
 * Shorten long scheme/company names for table display
 */
export const truncate = (str, maxLen = 40) => {
  if (!str) return '—'
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/**
 * Return Tailwind color classes based on BUY/SELL action
 */
export const getActionStyle = (action) => {
  if (action === 'BUY') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' }
  if (action === 'SELL') return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' }
  return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
}

/**
 * Return Tailwind color classes based on data source
 */
export const getSourceStyle = (source) => {
  const map = {
    aa:         { bg: 'bg-indigo-500/10', text: 'text-indigo-400', label: 'AA' },
    mf_central: { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   label: 'MF Central' },
    order:      { bg: 'bg-amber-500/10',  text: 'text-amber-400',  label: 'Order' },
  }
  return map[source] ?? { bg: 'bg-slate-500/10', text: 'text-slate-400', label: source }
}

/**
 * Return Tailwind color classes based on asset type
 */
export const getAssetTypeStyle = (type) => {
  const map = {
    mutual_fund: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', label: 'Mutual Fund' },
    equities:    { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Equity' },
    deposit:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  label: 'Deposit' },
    order:       { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Order' },
  }
  return map[type] ?? { bg: 'bg-slate-500/10', text: 'text-slate-400', label: type }
}
