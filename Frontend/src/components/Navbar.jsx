import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listUsers } from '../api/users'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isAdmin) return
    function fetchPending() {
      listUsers()
        .then(res => {
          const count = (res.data ?? []).filter(u => u.verificationStatus === 'pending').length
          setPendingCount(count)
        })
        .catch(() => {})
    }
    fetchPending()
    window.addEventListener('user-status-changed', fetchPending)
    return () => window.removeEventListener('user-status-changed', fetchPending)
  }, [isAdmin])

  const close = () => setOpen(false)
  const accountPath = isAdmin ? '/admin' : '/profile'

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-200/80 hover:text-white'}`

  return (
    <>
    <nav className="sticky top-0 z-40 border-b border-slate-800/70 bg-linear-to-r from-[#0f2a43] to-[#173f62] shadow-[0_16px_35px_-24px_rgba(15,42,67,0.85)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 text-white font-bold text-sm">TA</span>
            <span>
              <span className="block text-base font-bold tracking-tight text-white">TAPRO<span className="text-amber-300">AUTO</span></span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-200/80">Export Desk</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <NavLink to="/" onClick={close} className={navLinkClass}>Home</NavLink>
            <NavLink to="/about" onClick={close} className={navLinkClass}>About</NavLink>
            <NavLink to="/auctions" onClick={close} className={navLinkClass}>Auctions</NavLink>
            <NavLink to="/vehicles"  onClick={close} className={navLinkClass}>Vehicles</NavLink>
            {user && isAdmin && (
              <NavLink to="/admin" onClick={close} className={({ isActive }) =>
                `relative text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`
              }>
                Admin
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <NavLink
                to={accountPath}
                onClick={close}
                className={({ isActive }) =>
                  `account-icon ${isActive ? 'account-icon-active' : ''}`
                }
                aria-label={isAdmin ? 'Open admin account' : 'Open profile'}
                title={isAdmin ? 'Admin account' : 'Profile'}
              >
                <AccountIcon />
              </NavLink>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-200/80 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-slate-200/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu-open sm:hidden border-t border-slate-800/70 bg-[#0c2237] px-4 py-3 space-y-1">
          <MobileLink to="/" onClick={close}>Home</MobileLink>
          <MobileLink to="/about" onClick={close}>About</MobileLink>
          <MobileLink to="/auctions" onClick={close}>Auctions</MobileLink>
          <MobileLink to="/vehicles"  onClick={close}>Vehicles</MobileLink>
          {user && isAdmin && (
            <MobileLink to="/admin" onClick={close}>
              Admin
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </MobileLink>
          )}

          <div className="pt-2 mt-2 border-t border-gray-800">
            {user ? (
              <MobileLink to={accountPath} onClick={close}>
                <span className="inline-flex items-center gap-2">
                  <AccountIcon />
                  {isAdmin ? 'Admin Account' : 'Profile'}
                </span>
              </MobileLink>
            ) : (
              <div className="flex gap-2 px-1 pt-1">
                <Link to="/login" onClick={close}
                  className="flex-1 text-center text-sm text-slate-200 border border-slate-500/40 hover:border-slate-300/60 px-3 py-2 rounded-lg transition-colors"
                >Sign in</Link>
                <Link to="/register" onClick={close}
                  className="flex-1 text-center text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-2 rounded-lg transition-colors font-semibold"
                >Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
          isActive ? 'bg-white/10 text-white font-medium' : 'text-slate-200/80 hover:text-white hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function AccountIcon() {
  return (
    <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

