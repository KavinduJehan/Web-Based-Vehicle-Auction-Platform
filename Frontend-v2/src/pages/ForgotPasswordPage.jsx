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
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded border border-[#D8D8D8] p-8 sm:p-10 shadow-xs">
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
            ACCOUNT RECOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1 leading-relaxed">
            Enter your account email and we will send a secure reset link if the account exists.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 text-emerald-800 rounded p-3 text-xs mb-4 border border-emerald-200 font-semibold">
            {message}
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
              Business Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input-clean rounded"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-tapro-red w-full py-3 text-xs font-bold rounded cursor-pointer"
          >
            {loading ? 'Sending Link...' : 'Send Password Reset Link'}
          </button>
        </form>

        <p className="text-xs text-[#555555] mt-6 pt-4 border-t border-[#EAEAEA] text-center">
          Remembered your credentials?{' '}
          <Link to="/login" className="text-[#D01F26] hover:underline font-bold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
