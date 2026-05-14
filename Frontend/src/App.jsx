import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AppRouter from './router'
import { useAuth } from './context/AuthContext'
import { getMyWonAuctions } from './api/auctions'

function App() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [wonBanner, setWonBanner] = useState([])

  // Redirect to login on session expiry
  useEffect(() => {
    function onExpired() {
      navigate('/login', { state: { message: 'Your session expired due to inactivity. Please log in again.' } })
    }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [navigate])

  // Show "you won" banner for buyer when they are logged in
  useEffect(() => {
    if (!user || isAdmin) { setWonBanner([]); return }
    getMyWonAuctions()
      .then(res => {
        const wins = res.data ?? []
        // Only show banner if there are wins and user hasn't dismissed it this session
        const dismissed = JSON.parse(localStorage.getItem('wonDismissed') ?? '[]')
        const fresh = wins.filter(a => !dismissed.includes(a.id))
        setWonBanner(fresh)
      })
      .catch(() => {})
  }, [user?.sub])

  function dismissWon(auctionId) {
    const dismissed = JSON.parse(localStorage.getItem('wonDismissed') ?? '[]')
    localStorage.setItem('wonDismissed', JSON.stringify([...dismissed, auctionId]))
    setWonBanner(b => b.filter(a => a.id !== auctionId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Won auction banners */}
      {wonBanner.map(a => (
        <div
          key={a.id}
          className="bg-green-700 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-sm border-b border-green-800"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 font-semibold text-green-200 uppercase tracking-wide text-xs">You Won</span>
            <span className="text-white/90 truncate">
              <button
                onClick={() => { navigate(`/auctions/${a.id}`); dismissWon(a.id) }}
                className="font-semibold underline decoration-white/40 hover:decoration-white transition-colors"
              >
                {a.title || `${a.vehicle_make} ${a.vehicle_model} ${a.vehicle_year}`}
              </button>
              {' '}— USD <strong>{Number(a.winning_amount).toLocaleString()}</strong>
            </span>
          </span>
          <button
            onClick={() => dismissWon(a.id)}
            className="text-white/60 hover:text-white transition-colors shrink-0 text-base leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}

      <main>
        <AppRouter />
      </main>
    </div>
  )
}

export default App
