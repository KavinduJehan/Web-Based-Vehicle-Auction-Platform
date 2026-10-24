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

  return (
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded border border-[#D8D8D8] p-8 sm:p-10 shadow-xs">
        
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
            GLOBAL BUYER REGISTRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
            Create Verified Buyer Account
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-1">
            Register to access inspected vehicle condition sheets, priority stock reservations, and direct CIF port export quotes.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 text-xs font-semibold mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Full Name / Company Representative <span className="text-[#D01F26]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={onChange}
              placeholder="e.g. John Smith"
              className="form-input-clean rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
              Business Email Address <span className="text-[#D01F26]">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="importer@company.com"
              className="form-input-clean rounded"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Password <span className="text-[#D01F26]">*</span>
              </label>
              <button
                type="button"
                onClick={suggestPassword}
                className="text-xs font-bold text-[#D01F26] hover:underline"
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
                className="form-input-clean pr-16 rounded"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#777777] hover:text-[#1A1A1A]"
                tabIndex={-1}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {form.password && strength && (
              <div className="mt-2.5">
                <div className="flex gap-1.5 mb-1.5">
                  {['weak', 'medium', 'strong'].map((level, idx) => (
                    <span
                      key={level}
                      className="h-1.5 flex-1 rounded-sm transition-colors duration-200"
                      style={{
                        background: ['weak', 'medium', 'strong'].indexOf(strength.level) >= idx
                          ? strength.color
                          : '#E2E8F0',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold" style={{ color: strength.color }}>
                  {strength.label} password security
                </p>
              </div>
            )}

            {/* Password checklist using clean SVG icons, STRICTLY NO EMOJIS */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
              {[
                { ok: form.password.length >= 8, text: '8+ Characters' },
                { ok: /[A-Z]/.test(form.password), text: 'Uppercase Letter' },
                { ok: /[0-9]/.test(form.password), text: 'Number' },
                { ok: /[^A-Za-z0-9]/.test(form.password), text: 'Special Symbol' },
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

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading || strength?.level === 'weak'}
              className="btn-tapro-red w-full py-3 text-xs font-bold rounded cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Buyer Registration'}
            </button>
          </div>
        </form>

        <p className="text-xs text-[#555555] mt-6 pt-4 border-t border-[#EAEAEA] text-center">
          Already registered?{' '}
          <Link to="/login" className="text-[#D01F26] hover:underline font-bold">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  )
}
