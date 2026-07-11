import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await forgotPassword(email.trim())
      setMessage(res.data?.message ?? 'If an account exists for that email, a password reset link has been sent.')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to request a password reset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 520, marginTop: 32 }}>
      <div className="enterprise-panel p-7 md:p-9">
        <p className="eyebrow">Account recovery</p>
        <h1 style={{ marginTop: 8, fontSize: '1.5rem', fontWeight: 800, color: '#0b1724' }}>
          Reset your password
        </h1>
        <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Enter your account email and we will send a secure reset link if the account exists.
        </p>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 rounded-lg p-3 text-sm mt-5 border border-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mt-5 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: 22 }}>
          <div>
            <label className="label">Business Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-sm mt-5 text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="text-slate-900 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
