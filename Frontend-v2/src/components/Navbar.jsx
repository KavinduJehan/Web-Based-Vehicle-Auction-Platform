import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listUsers } from '../api/users'
import { DEALER_CONFIG } from '../config/appConfig'
import TaproLogo from './TaproLogo'

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
    `text-[12px] uppercase tracking-[0.14em] font-bold transition-all px-1 py-1.5 ${
      isActive ? 'text-white border-b-2 border-[#D01F26]' : 'text-[#D8D8D8] hover:text-white'
    }`

  return (
    <>
      {/* ── Operational Top Bar (Charcoal Dark #111111) ── */}
      <div className="bg-[#111111] text-[#D8D8D8] text-[11px] font-mono py-1.5 px-4 border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D01F26] animate-pulse" />
              INTERNATIONAL MOTOR EXPORT DESK
            </span>
            <span className="hidden md:inline text-[#D8D8D8]/40">|</span>
            <span className="hidden md:inline text-[#D8D8D8]/80">YOKOHAMA PORT DISPATCH</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[#D8D8D8]/80">VERIFIED EXPORT PARTNER</span>
            <a
              href={`https://wa.me/${DEALER_CONFIG.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D01F26] hover:underline font-bold"
            >
              WHATSAPP DESK
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Header (Charcoal #1A1A1A) ── */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A] border-b border-[#2C2C2C] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">

            {/* Official TaproAuto Horizontal White Brand Logo (Clean on Dark) */}
            <Link to="/" className="shrink-0 flex items-center group py-1" aria-label="TAPROAUTO Home">
              <img
                src="/taproauto_logo_white.png"
                alt="TAPROAUTO"
                className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              <NavLink to="/" onClick={close} className={navLinkClass}>Home</NavLink>
              <NavLink to="/vehicles" onClick={close} className={navLinkClass}>Vehicles</NavLink>
              <NavLink to="/about" onClick={close} className={navLinkClass}>About Us</NavLink>
              <NavLink to="/contact" onClick={close} className={navLinkClass}>Contact</NavLink>
              
              {user && isAdmin && (
                <NavLink to="/admin" onClick={close} className={({ isActive }) =>
                  `relative text-[12px] uppercase tracking-[0.14em] font-bold transition-all px-1 py-1.5 ${
                    isActive ? 'text-white' : 'text-[#D8D8D8] hover:text-white'
                  }`
                }>
                  Admin Desk
                  {pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-3.5 bg-[#D01F26] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </NavLink>
              )}
            </nav>

            {/* Auth Actions (Tapro Red #D01F26) */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <Link
                  to={accountPath}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#242424] border border-[#3A3A3A] text-xs font-bold uppercase tracking-wider text-white hover:border-[#D01F26] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D01F26]" />
                  {isAdmin ? 'Admin Console' : (user.name || 'Client Portal')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs uppercase tracking-wider font-bold text-[#D8D8D8] hover:text-white transition-colors px-2.5 py-1"
                  >
                    Client Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-tapro-red text-xs uppercase tracking-wider font-bold py-2 px-4 shadow-sm"
                  >
                    Register as Buyer
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 text-[#D8D8D8] hover:text-white"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="md:hidden bg-[#141414] border-t border-[#2A2A2A] px-4 py-3 space-y-2 text-xs">
            <Link to="/" onClick={close} className="block py-2 text-white font-bold uppercase tracking-wider">Home</Link>
            <Link to="/vehicles" onClick={close} className="block py-2 text-white font-bold uppercase tracking-wider">Vehicles</Link>
            <Link to="/about" onClick={close} className="block py-2 text-white font-bold uppercase tracking-wider">About Us</Link>
            <Link to="/contact" onClick={close} className="block py-2 text-white font-bold uppercase tracking-wider">Contact</Link>
            <div className="pt-3 border-t border-[#262626] flex gap-2">
              <Link to="/login" onClick={close} className="btn-outline-silver flex-1 text-center py-2 text-xs">Sign In</Link>
              <Link to="/register" onClick={close} className="btn-tapro-red flex-1 text-center py-2 text-xs">Register</Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
