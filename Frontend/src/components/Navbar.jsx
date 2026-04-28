import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/auctions')
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/auctions" className="text-xl font-bold tracking-tight">
        ThaproJapan
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/auctions" className="hover:text-gray-300 transition-colors">Auctions</Link>
        <Link to="/vehicles" className="hover:text-gray-300 transition-colors">Vehicles</Link>
        {user ? (
          <>
            {isAdmin && (
              <Link to="/admin" className="hover:text-gray-300 transition-colors">Admin</Link>
            )}
            {!isAdmin && (
              <Link to="/profile" className="hover:text-gray-300 transition-colors">Profile</Link>
            )}
            <span className="text-gray-400 text-xs">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
