import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const registered = searchParams.get('registered')
  const sessionMessage = location.state?.message ?? null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(email.trim(), password)
      login(res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/vehicles', { replace: true })
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach server. Please check backend configuration and try again.')
      } else {
        setError(err.response?.data?.message ?? 'Login failed. Please verify your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded border border-[#D8D8D8] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
        
        {/* Left Col: Japanese Export Desk Brand Identity (5 cols) */}
        <section className="lg:col-span-5 bg-[#111111] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A2A2A]">
          <div className="relative z-10 space-y-4">
            <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#D01F26]">
              EXPORT DESK &middot; PORTAL ACCESS
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Vehicle Direct Export Portal
            </h1>

            <p className="text-xs sm:text-sm text-[#D8D8D8]/80 leading-relaxed font-normal">
              Direct access to verified stock, comprehensive vehicle condition reports, proforma export invoices, and ocean shipping dispatch schedules.
            </p>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 space-y-3.5 text-xs text-[#D8D8D8]/80 font-mono">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-[#D01F26] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064</span>
            </div>

            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-[#D01F26] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Direct Hotline: +81 3-6426-7620</span>
            </div>

            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-[#D01F26] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Dispatch: Mon-Sat, 09:00-19:00 JST</span>
            </div>
          </div>
        </section>

        {/* Right Col: Sign In Form (7 cols) */}
        <section className="lg:col-span-7 p-8 lg:p-12 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
              VERIFIED BUYER ACCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Client Sign In
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Welcome back to your TAPROAUTO global vehicle procurement portal.
            </p>
          </div>

          {sessionMessage && (
            <div className="bg-amber-50 text-amber-800 rounded p-3 text-xs mb-4 border border-amber-200">
              {sessionMessage}
            </div>
          )}
          {registered && (
            <div className="bg-emerald-50 text-emerald-800 rounded p-3 text-xs mb-4 border border-emerald-200 font-semibold">
              Account registered successfully! Please sign in with your credentials.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 rounded p-3 text-xs mb-4 border border-red-200 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Business Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input-clean has-icon-left rounded"
                  placeholder="importer@company.com"
                />
                <svg className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#D01F26] hover:underline font-bold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input-clean has-icon-left has-icon-right rounded"
                  placeholder="••••••••"
                />
                <svg className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#777777] hover:text-[#1A1A1A]"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-tapro-red w-full py-3 text-xs font-bold rounded cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In to Buyer Portal'}
              </button>
            </div>
          </form>

          <p className="text-xs text-[#555555] mt-6 pt-4 border-t border-[#EAEAEA] text-center">
            New international buyer?{' '}
            <Link to="/register" className="text-[#D01F26] hover:underline font-bold">
              Register as verified importer
            </Link>
          </p>
        </section>

      </div>
    </div>
  )
}
