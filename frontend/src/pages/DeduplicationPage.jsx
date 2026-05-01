import { useEffect, useState } from 'react'
import { fetchDeduplicationReport } from '../api/client'
import DeduplicationReport from '../components/deduplication/DeduplicationReport'
import Spinner      from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function DeduplicationPage() {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchDeduplicationReport()
      .then(setReport)
      .catch(() => setError('Failed to load deduplication report.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Building deduplication report…" />
  if (error)   return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Deduplication Evidence</h1>
        <p className="text-slate-500 text-sm mt-1">
          Proof that overlapping records between MF Central and Account Aggregator
          are merged correctly — no double-counting in net worth.
        </p>
      </div>
      <DeduplicationReport report={report} />
    </div>
  )
}
