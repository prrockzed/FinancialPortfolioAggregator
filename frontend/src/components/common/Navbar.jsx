import { NavLink } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const navItems = [
  { to: '/',               label: 'Dashboard',    icon: '▦' },
  { to: '/holdings',       label: 'Holdings',     icon: '◈' },
  { to: '/transactions',   label: 'Transactions', icon: '⇅' },
  { to: '/deduplication',  label: 'Dedup Proof',  icon: '⊕' },
]

export default function Navbar() {
  const { users, selectedUserId, setSelectedUserId } = useUser()

  const selectedUser = users.find((u) => u.id === selectedUserId)
  const displayLabel = selectedUserId === 'all'
    ? 'All Users'
    : (selectedUser?.name || selectedUserId)

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2a3a] bg-[#0a0f1e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
            P
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-wide">Pivot Money</span>
            <span className="ml-2 text-[10px] text-slate-500 uppercase tracking-widest font-medium">Portfolio</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <span className="text-xs">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User selector */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="appearance-none bg-[#111827] border border-[#1e2a3a] text-slate-300 text-xs font-medium rounded-lg pl-8 pr-6 py-2 outline-none focus:border-indigo-500/50 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.id}
                </option>
              ))}
            </select>
            {/* User icon */}
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
              ◉
            </span>
            {/* Chevron */}
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[8px]">
              ▾
            </span>
          </div>

          {/* Status dot */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

      </div>
    </header>
  )
}
