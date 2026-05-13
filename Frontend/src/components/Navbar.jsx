import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const links = (
    <>
      <Link to="/auctions" onClick={close} className="hover:text-gray-300 transition-colors">Auctions</Link>
      <Link to="/vehicles"  onClick={close} className="hover:text-gray-300 transition-colors">Vehicles</Link>
      {user ? (
        <>
          {isAdmin && (
            <Link to="/admin" onClick={close} className="relative hover:text-gray-300 transition-colors">
              Admin
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )}
          {!isAdmin && (
            <Link to="/profile" onClick={close} className="hover:text-gray-300 transition-colors">Profile</Link>
          )}
          <span className="text-gray-400 text-xs truncate max-w-40">{user.email}</span>
          <button onClick={handleLogout} className="text-left hover:text-gray-300 transition-colors">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={close} className="hover:text-gray-300 transition-colors">Login</Link>
          <Link
            to="/register" onClick={close}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/auctions" className="text-xl font-bold tracking-tight">
          ThaproAUTO
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6 text-sm">{links}</div>

        {/* Hamburger */}
        <button
          className="sm:hidden p-1 rounded hover:text-gray-300 transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden flex flex-col gap-4 text-sm pt-4 pb-2 mt-4 border-t border-gray-700">
          {links}
        </div>
      )}
    </nav>
  )
}

