import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '@#$%&*!?'
  const all = upper + lower + digits + special
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  const pick = (charset, i) => charset[arr[i] % charset.length]
  const chars = [
    pick(upper, 0),
    pick(lower, 1),
    pick(digits, 2),
    pick(special, 3),
    ...Array.from({ length: 12 }, (_, i) => pick(all, i + 4)),
  ]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = arr[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

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

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  const strength = strengthOf(form.password)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await apiRegister(form.name, form.email, form.password)
      navigate('/login?registered=1')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function suggestPassword() {
    const password = generatePassword()
    setForm((f) => ({ ...f, password }))
    setShowPassword(true)
    navigator.clipboard?.writeText(password)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
      .catch(() => {})
  }

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', placeholder: 'John Smith' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
  ]

  return (
    <div className="page">
      <div className="enterprise-panel p-8 md:p-10 max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-500">Taproauto Buyer Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create buyer account</h1>
        <p className="text-sm text-slate-500 mt-2">
          Registration is available for buyers. Account bidding permissions are enabled after admin verification.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm my-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input
                type={type} name={name} required value={form[name]}
                onChange={onChange} placeholder={placeholder}
                className="input"
              />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="label mb-0">Password</label>
              <button
                type="button"
                onClick={suggestPassword}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900"
              >
                {copied ? 'Copied to clipboard' : 'Suggest strong password'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={onChange}
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="input pr-10"
                style={{ fontFamily: form.password ? 'monospace' : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 px-2"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {form.password && strength && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {['weak', 'medium', 'strong'].map((level, idx) => (
                    <span
                      key={level}
                      className="h-1.5 flex-1 rounded-full"
                      style={{
                        background: ['weak', 'medium', 'strong'].indexOf(strength.level) >= idx
                          ? strength.color
                          : '#d7e0ec',
                        transition: 'background 240ms ease',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold" style={{ color: strength.color }}>
                  {strength.label} password
                </p>
              </div>
            )}

            <ul className="mt-2 grid gap-1">
              {[
                { ok: form.password.length >= 8, text: 'At least 8 characters' },
                { ok: /[A-Z]/.test(form.password), text: 'Uppercase letter' },
                { ok: /[0-9]/.test(form.password), text: 'Number' },
                { ok: /[^A-Za-z0-9]/.test(form.password), text: 'Special character (@#$%&*!?)' },
              ].map(({ ok, text }) => (
                <li
                  key={text}
                  className={`text-xs ${ok ? 'text-emerald-700' : 'text-slate-500'}`}
                >
                  {ok ? '✓' : '○'} {text}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || strength?.level === 'weak'}
            className="btn-primary w-full py-2.5"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm mt-5 text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
