import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',               label: 'Dashboard',    icon: '▦' },
  { to: '/holdings',       label: 'Holdings',     icon: '◈' },
  { to: '/transactions',   label: 'Transactions', icon: '⇅' },
  { to: '/deduplication',  label: 'Dedup Proof',  icon: '⊕' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2a3a] bg-[#0a0f1e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
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

        {/* Status dot */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>
    </header>
  )
}
