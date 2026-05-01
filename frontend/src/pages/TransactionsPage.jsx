import { useUser } from '../context/UserContext'
import TransactionTable from '../components/transactions/TransactionTable'

export default function TransactionsPage() {
  const { selectedUserId } = useUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-slate-500 text-sm mt-1">
          Unified &amp; deduplicated across all three sources — sorted newest first.
        </p>
      </div>
      <TransactionTable userId={selectedUserId} />
    </div>
  )
}
