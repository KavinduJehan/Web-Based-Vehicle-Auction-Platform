import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

function strengthOf(password) {
  if (!password) return null
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { level: 'weak', label: 'Weak', color: '#ef4444' }
  if (score <= 4) return { level: 'medium', label: 'Medium', color: '#f59e0b' }
  return { level: 'strong', label: 'Strong', color: '#10b981' }
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const strength = strengthOf(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Password reset token is missing.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successfully. Please sign in with your new password.' }
      })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to reset password. Please request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 520, marginTop: 32 }}>
      <div className="enterprise-panel p-7 md:p-9">
        <p className="eyebrow">Account recovery</p>
        <h1 style={{ marginTop: 8, fontSize: '1.5rem', fontWeight: 800, color: '#0b1724' }}>
          Choose a new password
        </h1>
        <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Use a strong password that is unique to this account.
        </p>

        {!token && (
          <div className="bg-amber-50 text-amber-800 rounded-lg p-3 text-sm mt-5 border border-amber-200">
            This reset link is missing a token. Request a new password reset email.
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mt-5 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: 22 }}>
          <div>
            <label className="label">New password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                style={{ paddingRight: 64, fontFamily: password ? 'monospace' : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="text-sm text-slate-500 hover:text-slate-900"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {password && strength && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {['weak', 'medium', 'strong'].map((level, index) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 99,
                        background: ['weak', 'medium', 'strong'].indexOf(strength.level) >= index
                          ? strength.color
                          : 'var(--line)'
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>
                  {strength.label} password
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm new password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input"
              placeholder="Re-enter new password"
              autoComplete="new-password"
              style={{ fontFamily: confirm ? 'monospace' : undefined }}
            />
            {confirm && password && confirm !== password && (
              <p style={{ marginTop: 4, fontSize: '0.78rem', color: '#ef4444' }}>Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token || (password && strength?.level === 'weak')}
            className="btn-primary w-full py-2.5"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="text-sm mt-5 text-slate-500">
          Need a new link?{' '}
          <Link to="/forgot-password" className="text-slate-900 hover:underline font-semibold">
            Request password reset
          </Link>
        </p>
      </div>
    </div>
  )
}
