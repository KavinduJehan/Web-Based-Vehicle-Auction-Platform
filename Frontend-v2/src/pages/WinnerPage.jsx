import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWinner } from '../api/auctions'
import Spinner from '../components/Spinner'

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

  if (loading) return <Spinner />

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
        <div className="flex justify-center mb-4 text-[#D01F26]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-14 h-14">
            <path d="M6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
            <path d="M18 9h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
            <path d="M4 3h16v7a8 8 0 0 1-16 0V3z" />
            <path d="M12 17v4m-4 0h8" />
          </svg>
        </div>
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
              USD {Number(winner.winningBid.amount).toLocaleString()}
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
