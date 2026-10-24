import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/users'

// Generate a cryptographically random strong password
function generatePassword() {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower  = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '@#$%&*!?'
  const all = upper + lower + digits + special
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  // Guarantee at least one of each required class
  const pick = (charset) => charset[arr[0] % charset.length]
  const base = [
    pick(upper), pick(lower), pick(digits), pick(special),
    ...Array.from({ length: 12 }, (_, i) => all[arr[i + 4] % all.length]),
  ]
  // Shuffle using Fisher-Yates with the same random bytes
  for (let i = base.length - 1; i > 0; i--) {
    const j = arr[i] % (i + 1);
    [base[i], base[j]] = [base[j], base[i]]
  }
  return base.join('')
}

function strengthOf(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { level: 'weak',   label: 'Weak',   color: '#ef4444' }
  if (score <= 4) return { level: 'medium', label: 'Medium', color: '#f59e0b' }
  return              { level: 'strong',  label: 'Strong',  color: '#10b981' }
}

export default function ChangePasswordPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showNext, setShowNext]   = useState(false)
  const [copied, setCopied]       = useState(false)

  const strength = strengthOf(next)

  function handleSuggest() {
    const pw = generatePassword()
    setNext(pw)
    setConfirm(pw)
    setShowNext(true)
    navigator.clipboard?.writeText(pw).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await changePassword(current, next)
      login({ ...user, mustChangePassword: false })
      navigate(user?.role === 'admin' ? '/admin' : '/auctions', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded border border-[#D8D8D8] p-8 sm:p-10 shadow-xs">
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
            ACCOUNT SECURITY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
            Set Permanent Password
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1 leading-relaxed">
            Your account was created with a temporary password. Choose a strong permanent one before continuing.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded p-3 text-xs mb-4 border border-red-200 font-semibold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Current (Temporary) Password
            </label>
            <input
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              autoComplete="current-password"
              className="form-input-clean rounded"
            />
          </div>

          {/* Suggest button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                New Password
              </label>
              <button
                type="button"
                onClick={handleSuggest}
                className="text-xs font-bold text-[#D01F26] hover:underline"
              >
                {copied ? 'Copied to clipboard!' : 'Suggest strong password'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={e => { setNext(e.target.value); setCopied(false) }}
                required
                autoComplete="new-password"
                className="form-input-clean pr-16 rounded"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNext(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#777777] hover:text-[#1A1A1A]"
                tabIndex={-1}
              >
                {showNext ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Strength meter */}
            {next && strength && (
              <div className="mt-2.5">
                <div className="flex gap-1.5 mb-1.5">
                  {['weak', 'medium', 'strong'].map((lvl, i) => (
                    <div
                      key={lvl}
                      className="h-1.5 flex-1 rounded-sm transition-colors duration-200"
                      style={{
                        background: ['weak','medium','strong'].indexOf(strength.level) >= i
                          ? strength.color : '#E2E8F0',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold" style={{ color: strength.color }}>
                  {strength.label} password security
                </p>
              </div>
            )}

            {/* Requirements checklist */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
              {[
                { ok: next.length >= 8,          text: '8+ Characters' },
                { ok: /[A-Z]/.test(next),         text: 'Uppercase Letter' },
                { ok: /[0-9]/.test(next),         text: 'Number' },
                { ok: /[^A-Za-z0-9]/.test(next),  text: 'Special Symbol' },
              ].map(({ ok, text }) => (
                <div
                  key={text}
                  className={`flex items-center gap-1.5 ${ok ? 'text-emerald-700 font-bold' : 'text-[#777777]'}`}
                >
                  <svg className={`w-3.5 h-3.5 shrink-0 ${ok ? 'text-emerald-600' : 'text-[#CCCCCC]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={ok ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showNext ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="form-input-clean rounded"
              placeholder="Re-enter new password"
            />
            {confirm && next && confirm !== next && (
              <p className="text-xs text-[#D01F26] font-bold mt-1.5">Passwords do not match</p>
            )}
            {confirm && next && confirm === next && (
              <p className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                </svg>
                Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (next && strength?.level === 'weak')}
            className="btn-tapro-red w-full py-3 text-xs font-bold rounded cursor-pointer mt-2"
          >
            {loading ? 'Saving…' : 'Save Permanent Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
