import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAuctions } from '../api/auctions'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'

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
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D8D8D8] pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
              VERIFIED MOTOR AUCTION CATALOG
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Vehicle Auctions
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Transparent bidding and verified Japanese export inventory ready for global shipping dispatch.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-white border border-[#D8D8D8] text-[#1A1A1A] px-3.5 py-1.5 rounded self-start sm:self-auto">
            {auctions.length} Total Lots
          </span>
        </div>

        {/* Top Toolbar / Filter Tabs */}
        <div className="bg-white border border-[#D8D8D8] rounded p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mb-6 shadow-xs">
          <span className="font-mono text-[#555555]">
            Showing <strong>{displayed.length}</strong> active {displayed.length === 1 ? 'auction' : 'auctions'}
          </span>

          <div className="flex gap-1.5 bg-[#FAF8F5] p-1 rounded border border-[#EBEBEB]">
            {FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === s ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#555555] hover:text-[#1A1A1A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {displayed.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#D8D8D8] rounded shadow-xs">
            <p className="text-sm font-mono text-[#777777]">No {filter === 'all' ? '' : filter} auctions currently listed.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map(a => (
            <Link
              key={a.id}
              to={`/auctions/${a.id}`}
              className="lot-card flex flex-col bg-white group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-[#1A1A1A] overflow-hidden border-b border-[#D8D8D8]">
                {a.vehicle_images?.[0] ? (
                  <img
                    src={toMediaUrl(a.vehicle_images[0])}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                <h3 className="font-bold text-[#1A1A1A] leading-snug line-clamp-2 text-sm group-hover:text-[#D01F26] transition-colors">
                  {a.title}
                </h3>

                {(a.vehicle_make || a.vehicle_year) && (
                  <p className="text-xs text-[#555555] font-mono">
                    {[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-xs">
                  {a.status === 'active' && a.ends_at ? (
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <span className="text-[11px] uppercase tracking-wider font-mono">Closes:</span>
                      <span className="font-bold text-[#D01F26]"><CountdownTimer endsAt={a.ends_at} /></span>
                    </div>
                  ) : a.status === 'ended' ? (
                    <p className="text-xs text-[#777777]">
                      Ended {a.ends_at ? new Date(a.ends_at).toLocaleDateString() : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-[#777777]">
                      {a.ends_at ? `Scheduled · ${new Date(a.ends_at).toLocaleDateString()}` : 'Not scheduled'}
                    </p>
                  )}
                  <span className="text-[11px] font-bold text-[#D01F26] uppercase tracking-wider group-hover:underline">
                    View Lot &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
