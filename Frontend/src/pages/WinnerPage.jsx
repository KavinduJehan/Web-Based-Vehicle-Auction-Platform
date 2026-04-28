import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWinner } from '../api/auctions'

export default function WinnerPage() {
  const { id } = useParams()
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWinner(id)
      .then(res => setWinner(res.data))
      .catch(err => setError(err.response?.data?.message ?? 'No winner found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-12 text-center text-gray-400">Loading…</div>

  if (error) return (
    <div className="max-w-lg mx-auto px-6 py-8 text-center">
      <p className="text-gray-500 mb-4">{error}</p>
      <Link to={`/auctions/${id}`} className="text-blue-600 hover:underline text-sm">
        ← Back to auction
      </Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold mb-1">{winner.auctionTitle}</h1>
        <p className="text-gray-500 text-sm mb-6">Auction ended</p>

        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Winner</p>
            <p className="font-semibold text-gray-900">{winner.winner.name}</p>
            <p className="text-sm text-gray-500">{winner.winner.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Winning Bid</p>
            <p className="text-2xl font-bold text-blue-600">
              ${Number(winner.winningBid.amount).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(winner.winningBid.placedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Link to="/auctions" className="text-blue-600 hover:underline text-sm">
          ← Back to auctions
        </Link>
      </div>
    </div>
  )
}
