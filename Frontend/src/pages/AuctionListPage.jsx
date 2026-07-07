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
      <div className="enterprise-panel bg-linear-to-r from-[#0f2a43] to-[#1f4d76] text-white p-6 md:p-8 mb-8 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-40 w-40 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-200">Live Marketplace</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-white">Vehicle Auctions</h1>
            <p className="text-sm text-slate-200/90 mt-1">Transparent bidding and verified buyers for export-ready inventory.</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-3 self-start sm:self-auto">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-200">Total Listings</p>
            <p className="text-2xl font-semibold text-white">{auctions.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Browse by status</h2>
          <p className="text-sm text-slate-500 mt-0.5">{displayed.length} visible auction{displayed.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-200/70 p-1 rounded-lg self-start sm:self-auto">
          {FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
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
          <p className="text-slate-500 font-medium">No {filter === 'all' ? '' : filter} auctions found.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map(a => (
          <Link
            key={a.id}
            to={`/auctions/${a.id}`}
            className="card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 flex flex-col group"
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
              <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{a.title}</h3>

              {(a.vehicle_make || a.vehicle_year) && (
                <p className="text-xs text-slate-500">
                  {[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="mt-auto pt-2 border-t border-slate-100">
                {a.status === 'active' && a.ends_at ? (
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <span>Closes in</span>
                    <span className="font-medium text-slate-800"><CountdownTimer endsAt={a.ends_at} /></span>
                  </div>
                ) : a.status === 'ended' ? (
                  <p className="text-xs text-slate-500">
                    Ended {a.ends_at ? new Date(a.ends_at).toLocaleDateString() : ''}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
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
