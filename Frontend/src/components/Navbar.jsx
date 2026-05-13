import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listUsers } from '../api/users'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
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

  function handleLogout() {
    logout()
    navigate('/auctions')
    setOpen(false)
  }

  const close = () => setOpen(false)

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/auctions" className="text-base font-bold tracking-tight text-white shrink-0">
            Thapro<span className="text-blue-400">AUTO</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
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
            {user && !isAdmin && (
              <NavLink to="/profile" onClick={close} className={navLinkClass}>Profile</NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs text-gray-500 truncate max-w-36">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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
        <div className="sm:hidden border-t border-gray-800 bg-gray-950 px-4 py-3 space-y-1">
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
          {user && !isAdmin && <MobileLink to="/profile" onClick={close}>Profile</MobileLink>}

          <div className="pt-2 mt-2 border-t border-gray-800">
            {user ? (
              <>
                <p className="text-xs text-gray-500 px-3 py-1 truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-1 pt-1">
                <Link to="/login" onClick={close}
                  className="flex-1 text-center text-sm text-gray-300 border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition-colors"
                >Sign in</Link>
                <Link to="/register" onClick={close}
                  className="flex-1 text-center text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors font-medium"
                >Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
          isActive ? 'bg-gray-800 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`
      }
    >
      {children}
    </NavLink>
  )
}


