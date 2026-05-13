import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role, skipPasswordCheck }) {
  const { user, loading } = useAuth()
  if (loading) return null                         // wait for session restore before deciding
  if (!user) return <Navigate to="/login" replace />
  if (!skipPasswordCheck && user.mustChangePassword) return <Navigate to="/change-password" replace />
  if (role && user.role !== role) return <Navigate to="/auctions" replace />
  return children
}
