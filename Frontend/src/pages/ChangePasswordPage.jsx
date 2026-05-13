import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/users'

export default function ChangePasswordPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

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
      // Update user in context — mustChangePassword is now false
      login({ ...user, mustChangePassword: false })
      navigate(user?.role === 'admin' ? '/admin' : '/auctions', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Change your password</h1>
        <p className="text-gray-500 text-sm mb-6">
          You must set a new password before continuing.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current (temporary) password
            </label>
            <input
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  )
}
