import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar           from './components/common/Navbar'
import DashboardPage    from './pages/DashboardPage'
import HoldingsPage     from './pages/HoldingsPage'
import TransactionsPage from './pages/TransactionsPage'
import DeduplicationPage from './pages/DeduplicationPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          <Routes>
            <Route path="/"              element={<DashboardPage />} />
            <Route path="/holdings"      element={<HoldingsPage />} />
            <Route path="/transactions"  element={<TransactionsPage />} />
            <Route path="/deduplication" element={<DeduplicationPage />} />
          </Routes>
        </main>

        <footer className="border-t border-[#1e2a3a] py-4 text-center text-slate-600 text-xs">
          Pivot Money · Financial Portfolio Aggregator
        </footer>
      </div>
    </BrowserRouter>
  )
}
