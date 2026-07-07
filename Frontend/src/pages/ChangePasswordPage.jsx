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
    <div className="page" style={{ maxWidth: 520, marginTop: 32 }}>
      <div className="enterprise-panel p-7 md:p-9">

        <p className="eyebrow">Account security</p>
        <h1 style={{ marginTop: 8, fontSize: '1.5rem', fontWeight: 800, color: '#0b1724' }}>
          Set a permanent password
        </h1>
        <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Your account was created with a temporary password. Choose a strong permanent one before continuing.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mt-5 border border-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ marginTop: 22 }}>
          {/* Current password */}
          <div>
            <label className="label">Current (temporary) password</label>
            <input
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
            />
          </div>

          {/* Suggest button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: -6 }}>
            <label className="label" style={{ margin: 0 }}>New password</label>
            <button
              type="button"
              onClick={handleSuggest}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--brand-sky)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {copied ? 'Copied to clipboard!' : 'Suggest strong password'}
            </button>
          </div>

          {/* New password input + show/hide + strength bar */}
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={e => { setNext(e.target.value); setCopied(false) }}
                required
                autoComplete="new-password"
                className="input"
                style={{ paddingRight: 40, fontFamily: next ? 'monospace' : undefined }}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNext(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2,
                }}
                tabIndex={-1}
                aria-label={showNext ? 'Hide password' : 'Show password'}
              >
                {showNext
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Strength meter */}
            {next && strength && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {['weak', 'medium', 'strong'].map((lvl, i) => (
                    <div key={lvl} style={{
                      flex: 1, height: 4, borderRadius: 99,
                      background: ['weak','medium','strong'].indexOf(strength.level) >= i
                        ? strength.color : 'var(--line)',
                      transition: 'background 250ms ease',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>
                  {strength.label} password
                  {strength.level !== 'strong' && (
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                      {' — add '}
                      {!/[A-Z]/.test(next) && 'uppercase, '}
                      {!/[0-9]/.test(next) && 'numbers, '}
                      {!/[^A-Za-z0-9]/.test(next) && 'symbols, '}
                      {next.length < 12 && '12+ characters'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Requirements checklist */}
            <ul style={{ marginTop: 8, display: 'grid', gap: 3 }}>
              {[
                { ok: next.length >= 8,          text: 'At least 8 characters' },
                { ok: /[A-Z]/.test(next),         text: 'Uppercase letter' },
                { ok: /[0-9]/.test(next),         text: 'Number' },
                { ok: /[^A-Za-z0-9]/.test(next),  text: 'Special character (@#$%&*!?)' },
              ].map(({ ok, text }) => (
                <li key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.78rem',
                  color: ok ? '#059669' : 'var(--muted)',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"
                    style={{ flexShrink: 0, stroke: ok ? '#059669' : 'var(--line)' }}>
                    {ok
                      ? <polyline points="20 6 9 17 4 12" />
                      : <circle cx="12" cy="12" r="10" />}
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm */}
          <div>
            <label className="label">Confirm new password</label>
            <input
              type={showNext ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="input"
              style={{ fontFamily: confirm ? 'monospace' : undefined }}
              placeholder="Re-enter new password"
            />
            {confirm && next && confirm !== next && (
              <p style={{ marginTop: 4, fontSize: '0.78rem', color: '#ef4444' }}>Passwords do not match</p>
            )}
            {confirm && next && confirm === next && (
              <p style={{ marginTop: 4, fontSize: '0.78rem', color: '#059669' }}>✓ Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (next && strength?.level === 'weak')}
            className="btn-primary"
            style={{ width: '100%', paddingTop: 11, paddingBottom: 11, marginTop: 4 }}
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  )
}
