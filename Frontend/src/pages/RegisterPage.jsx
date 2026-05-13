import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
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

  const fields = [
    { name: 'name',     label: 'Full name',  type: 'text',     placeholder: 'John Smith' },
    { name: 'email',    label: 'Email',       type: 'email',    placeholder: 'you@example.com' },
    { name: 'password', label: 'Password',    type: 'password', placeholder: '8+ characters' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Register as a buyer on Thapro<span className="font-semibold text-blue-600">AUTO</span></p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type} name={name} required value={form[name]}
                onChange={onChange} placeholder={placeholder}
                minLength={name === 'password' ? 8 : undefined}
                className="input"
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
