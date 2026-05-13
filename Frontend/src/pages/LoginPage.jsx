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
      const res = await apiLogin(email, password)
      login(res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/auctions', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to Thapro<span className="font-semibold text-blue-600">AUTO</span></p>
        </div>

        {sessionMessage && (
          <div className="bg-yellow-50 text-yellow-800 rounded-lg p-3 text-sm mb-4">
            {sessionMessage}
          </div>
        )}
        {registered && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm mb-4">
            Account created! Please sign in.
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
