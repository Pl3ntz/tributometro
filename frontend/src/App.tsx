import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Eye, Scan, GitCompare, Home as HomeIcon } from 'lucide-react'
import Landing from './pages/Landing'
import SalaryXRay from './pages/SalaryXRay'
import Comparativo from './pages/Comparativo'

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  const navItems = [
    { to: '/', icon: HomeIcon, label: 'Início', end: true },
    { to: '/raio-x', icon: Scan, label: 'Raio-X' },
    { to: '/comparativo', icon: GitCompare, label: 'CLT vs PJ' },
  ]

  // Landing page renders full-width without sidebar
  if (isLanding) {
    return (
      <div className="min-h-screen bg-surface-0">
        <Landing />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0 flex">
      {/* Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col w-64 bg-surface-1 shadow-elevated fixed h-screen z-40"
        initial={{ x: -64, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="p-6 pb-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow">
              <Eye size={20} className="text-accent-200" />
            </div>
            <div>
              <span className="text-lg font-semibold text-txt-primary">Tributô</span>
              <span className="text-lg font-light text-accent-400">Metro</span>
            </div>
          </NavLink>
          <p className="text-[10px] text-txt-tertiary mt-2 uppercase tracking-wider">Cada centavo exposto</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent-800 text-accent-400 shadow-glow'
                    : 'text-txt-tertiary hover:text-txt-secondary hover:bg-surface-2'
                }`
              }
            >
              <Icon size={18} className="group-hover:scale-110 transition-transform" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-accent-900 shadow-glow">
          <p className="text-base font-bold text-accent-300 font-mono tabular-nums">40,82%</p>
          <p className="text-[10px] text-txt-tertiary mt-1 leading-tight">da sua renda vai para impostos no Brasil</p>
        </div>
      </motion.aside>

      {/* Mobile nav */}
      <motion.nav
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-1 shadow-elevated"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow">
              <Eye size={14} className="text-accent-200" />
            </div>
            <span className="text-sm font-semibold text-txt-primary">Tributô<span className="text-accent-400 font-light">Metro</span></span>
          </NavLink>
          <div className="flex gap-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `p-2.5 rounded-lg transition-colors ${isActive ? 'bg-accent-800 text-accent-400' : 'text-txt-tertiary'}`
                }
              >
                <Icon size={18} aria-hidden="true" />
              </NavLink>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/raio-x" element={<SalaryXRay />} />
                <Route path="/comparativo" element={<Comparativo />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default App
