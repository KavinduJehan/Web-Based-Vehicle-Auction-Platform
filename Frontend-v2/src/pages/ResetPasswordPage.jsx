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
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded border border-[#D8D8D8] p-8 sm:p-10 shadow-xs">
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
            ACCOUNT RECOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
            Choose New Password
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1 leading-relaxed">
            Create a strong, permanent password to secure your export account access.
          </p>
        </div>

        {!token && (
          <div className="bg-amber-50 text-amber-800 rounded p-3 text-xs mb-4 border border-amber-200 font-semibold">
            This reset link is missing a token. Request a new password reset email.
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
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input-clean pr-16 rounded"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#777777] hover:text-[#1A1A1A]"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {password && strength && (
              <div className="mt-2.5">
                <div className="flex gap-1.5 mb-1.5">
                  {['weak', 'medium', 'strong'].map((level, index) => (
                    <div
                      key={level}
                      className="h-1.5 flex-1 rounded-sm transition-colors duration-200"
                      style={{
                        background: ['weak', 'medium', 'strong'].indexOf(strength.level) >= index
                          ? strength.color
                          : '#E2E8F0'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold" style={{ color: strength.color }}>
                  {strength.label} password security
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="form-input-clean rounded"
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            {confirm && password && confirm !== password && (
              <p className="text-xs text-[#D01F26] font-bold mt-1.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token || (password && strength?.level === 'weak')}
            className="btn-tapro-red w-full py-3 text-xs font-bold rounded cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
          </button>
        </form>

        <p className="text-xs text-[#555555] mt-6 pt-4 border-t border-[#EAEAEA] text-center">
          Need a new reset link?{' '}
          <Link to="/forgot-password" className="text-[#D01F26] hover:underline font-bold">
            Request fresh link
          </Link>
        </p>
      </div>
    </div>
  )
}
