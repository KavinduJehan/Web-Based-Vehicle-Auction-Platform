import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAuctions } from '../api/auctions'
import StatusBadge from '../components/StatusBadge'

export default function AuctionListPage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    listAuctions()
      .then(res => setAuctions(res.data))
      .catch(() => setError('Failed to load auctions'))
      .finally(() => setLoading(false))
  }, [])

  const displayed = filter === 'all'
    ? auctions
    : auctions.filter(a => a.status === filter)

  if (loading) return (
    <div className="p-12 text-center text-gray-400">Loading auctions…</div>
  )
  if (error) return (
    <div className="p-12 text-center text-red-600">{error}</div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>

        {/* Status filter */}
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'ended'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No auctions found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map(a => (
          <Link
            key={a.id}
            to={`/auctions/${a.id}`}
            className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-gray-900 truncate">{a.title}</h2>
              <StatusBadge status={a.status} />
            </div>
            {a.description && (
              <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-auto">
              {a.ends_at
                ? `Ends ${new Date(a.ends_at).toLocaleDateString()}`
                : 'No end date set'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
