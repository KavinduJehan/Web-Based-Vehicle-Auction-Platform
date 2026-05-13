import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAuctions } from '../api/auctions'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import Spinner from '../components/Spinner'

const FILTERS = ['all', 'active', 'draft', 'ended']

function CarPlaceholder() {
  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
      <svg className="w-14 h-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17H5a2 2 0 01-2-2v-4l2-5h10l2 5v4a2 2 0 01-2 2h-3m-4 0h4m-4 0a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
      </svg>
    </div>
  )
}

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

  const displayed = filter === 'all' ? auctions : auctions.filter(a => a.status === filter)

  if (loading) return <Spinner />
  if (error) return (
    <div className="page">
      <div className="card p-12 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-gray-400 mt-1">Please try refreshing the page.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{auctions.length} listing{auctions.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
          {FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-gray-400 font-medium">No {filter === 'all' ? '' : filter} auctions found.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map(a => (
          <Link
            key={a.id}
            to={`/auctions/${a.id}`}
            className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col group"
          >
            {/* Thumbnail */}
            <div className="relative overflow-hidden">
              {a.vehicle_images?.[0] ? (
                <img
                  src={a.vehicle_images[0]}
                  alt={a.title}
                  className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-200"
                />
              ) : (
                <CarPlaceholder />
              )}
              <div className="absolute top-2.5 right-2.5">
                <StatusBadge status={a.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h2 className="font-semibold text-gray-900 leading-snug line-clamp-2">{a.title}</h2>

              {(a.vehicle_make || a.vehicle_year) && (
                <p className="text-xs text-gray-400">
                  {[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="mt-auto pt-2 border-t border-gray-50">
                {a.status === 'active' && a.ends_at ? (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Closes in</span>
                    <span className="font-medium text-gray-700"><CountdownTimer endsAt={a.ends_at} /></span>
                  </div>
                ) : a.status === 'ended' ? (
                  <p className="text-xs text-gray-400">
                    Ended {a.ends_at ? new Date(a.ends_at).toLocaleDateString() : ''}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    {a.ends_at ? `Scheduled · ${new Date(a.ends_at).toLocaleDateString()}` : 'Not scheduled'}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
