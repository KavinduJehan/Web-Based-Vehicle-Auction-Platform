import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      navigate(res.data.user.role === 'admin' ? '/admin' : '/auctions', { replace: true })
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach server. Please check backend/CORS configuration and try again.')
      } else {
        setError(err.response?.data?.message ?? 'Login failed. Check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="enterprise-panel overflow-hidden grid lg:grid-cols-2">
        <section className="bg-linear-to-br from-[#0f2a43] to-[#173f62] text-white p-8 lg:p-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-200 uppercase">Tapro Japan Export Desk</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">Enterprise Vehicle Auction Operations</h1>
          <p className="mt-4 text-slate-200/90 text-sm leading-6 max-w-md">
            Access secure, time-bound vehicle auctions managed by Taproauto for verified global buyers.
          </p>

          <dl className="mt-8 space-y-3 text-sm text-slate-100/90">
            <div>
              <dt className="font-semibold text-white">Address</dt>
              <dd>1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Phone</dt>
              <dd>+81 3-6426-7620</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Office Hours</dt>
              <dd>Mon-Fri, 9:00-18:00 JST</dd>
            </div>
          </dl>
        </section>

        <section className="p-8 lg:p-10 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">Welcome back to Taproauto buyer and admin portal.</p>
          </div>

          {sessionMessage && (
            <div className="bg-amber-50 text-amber-800 rounded-lg p-3 text-sm mb-4 border border-amber-200">
              {sessionMessage}
            </div>
          )}
          {registered && (
            <div className="bg-emerald-50 text-emerald-700 rounded-lg p-3 text-sm mb-4 border border-emerald-200">
              Account created! Please sign in.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Business Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm mt-5 text-slate-500">
            No account?{' '}
            <Link to="/register" className="text-slate-900 hover:underline font-semibold">
              Register as buyer
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
