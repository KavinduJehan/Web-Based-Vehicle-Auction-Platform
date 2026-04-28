import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAuction } from '../api/auctions'
import { listBids, placeBid } from '../api/bids'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function AuctionDetailPage() {
  const { id } = useParams()
  const { user, isVerified, isAdmin } = useAuth()

  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [amount, setAmount] = useState('')
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState('')
  const [bidLoading, setBidLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const aRes = await getAuction(id)
    setAuction(aRes.data)

    if (user) {
      try {
        const bRes = await listBids(id)
        setBids(bRes.data)
      } catch {
        setBids([])
      }
    }
  }, [id, user])

  useEffect(() => {
    load().catch(() => setError('Failed to load auction')).finally(() => setLoading(false))
  }, [load])

  async function handleBid(e) {
    e.preventDefault()
    setBidError('')
    setBidSuccess('')
    setBidLoading(true)
    try {
      await placeBid(id, Number(amount))
      setBidSuccess('Bid placed successfully!')
      setAmount('')
      await load()
    } catch (err) {
      setBidError(err.response?.data?.message ?? 'Failed to place bid')
    } finally {
      setBidLoading(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-gray-400">Loading…</div>
  if (error || !auction) return <div className="p-12 text-center text-red-600">{error || 'Auction not found'}</div>

  const sortedBids = [...bids].sort((a, b) => Number(b.amount) - Number(a.amount))
  const highest = sortedBids.length > 0 ? Number(sortedBids[0].amount) : null
  const increment = Number(auction.min_increment ?? 0)
  const minNext = highest != null
    ? highest + (increment > 0 ? increment : 1)
    : Number(auction.starting_price ?? 0)

  const canBid = auction.status === 'active' && user && !isAdmin

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
          {auction.description && (
            <p className="text-gray-500 mt-1">{auction.description}</p>
          )}
        </div>
        <StatusBadge status={auction.status} />
      </div>

      {/* Meta */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 grid grid-cols-2 gap-2">
        {auction.starts_at && (
          <span>Starts: <b>{new Date(auction.starts_at).toLocaleString()}</b></span>
        )}
        {auction.ends_at && (
          <span>Ends: <b>{new Date(auction.ends_at).toLocaleString()}</b></span>
        )}
        {increment > 0 && (
          <span>Min increment: <b>${increment.toLocaleString()}</b></span>
        )}
      </div>

      {/* Current highest bid */}
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500 mb-1">Current highest bid</p>
        <p className="text-3xl font-bold text-blue-600">
          {highest != null
            ? `$${highest.toLocaleString()}`
            : `Starting at $${Number(auction.starting_price ?? 0).toLocaleString()}`}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Bid form */}
      {canBid && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Place a Bid</h2>

          {!isVerified ? (
            <div className="bg-yellow-50 text-yellow-800 rounded-lg p-3 text-sm">
              Your account is pending admin verification. You cannot place bids yet.
            </div>
          ) : (
            <form onSubmit={handleBid} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Amount (minimum ${minNext.toLocaleString()})
                </label>
                <input
                  type="number" min={minNext} step="1" required
                  value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit" disabled={bidLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {bidLoading ? 'Placing…' : 'Bid'}
              </button>
            </form>
          )}

          {bidError   && <p className="text-red-600 text-sm mt-2">{bidError}</p>}
          {bidSuccess && <p className="text-green-600 text-sm mt-2">{bidSuccess}</p>}
        </div>
      )}

      {/* Not logged in nudge */}
      {auction.status === 'active' && !user && (
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
          <Link to="/login" className="font-semibold hover:underline">Sign in</Link> to place a bid.
        </div>
      )}

      {/* Winner banner */}
      {auction.status === 'ended' && (
        <Link
          to={`/auctions/${id}/winner`}
          className="block bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800 hover:bg-purple-100 transition-colors text-center font-medium"
        >
          This auction has ended — view winner →
        </Link>
      )}

      {/* Bid history */}
      {sortedBids.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-3">Bid History</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b text-xs uppercase tracking-wider">
                <th className="pb-2">Amount</th>
                <th className="pb-2">Placed</th>
              </tr>
            </thead>
            <tbody>
              {sortedBids.map((b, i) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">
                    {i === 0 && <span className="text-green-600 mr-1">★</span>}
                    ${Number(b.amount).toLocaleString()}
                  </td>
                  <td className="py-2 text-gray-400">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
