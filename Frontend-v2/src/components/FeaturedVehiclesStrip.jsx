import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listVehicles } from '../api/vehicles'
import { toMediaUrl } from '../utils/mediaUrl'

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="strip-placeholder-icon">
      <path d="M5 17H3a2 2 0 01-2-2v-4l2-6h14l2 6v4a2 2 0 01-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  )
}

function statusBadge(status) {
  if (status === 'listed' || !status) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FAF8F5] text-[#1A1A1A] border border-[#D8D8D8]">
        Available
      </span>
    )
  }
  if (status === 'reserved') {
    return <span className="strip-badge strip-badge--draft">Reserved</span>
  }
  return <span className="strip-badge strip-badge--ended">{status}</span>
}

export default function FeaturedVehiclesStrip() {
  const [vehicles, setVehicles] = useState([])
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)

  useEffect(() => {
    listVehicles({ limit: 10, sortBy: 'created_at', order: 'desc' })
      .then(res => {
        const all = res.data?.data ?? res.data ?? []
        setVehicles(Array.isArray(all) ? all.slice(0, 10) : [])
      })
      .catch(() => {})
  }, [])

  if (vehicles.length === 0) return null

  // Duplicate for seamless infinite scroll
  const items = vehicles.length < 4
    ? [...vehicles, ...vehicles, ...vehicles, ...vehicles]
    : [...vehicles, ...vehicles]

  return (
    <section className="strip-shell">
      <div className="strip-header">
        <div>
          <p className="eyebrow">Premier Inventory</p>
          <h2>Featured showroom arrivals</h2>
        </div>
        <Link to="/vehicles" className="btn-secondary strip-view-all">
          Explore all showroom
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Rail */}
      <div
        className="strip-rail"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="strip-track"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {items.map((v, i) => {
            const img = v.images?.[0]
            const price = Number(v.starting_price ?? 0)

            return (
              <Link
                key={`${v.id}-${i}`}
                to={`/vehicles/${v.id}`}
                className="strip-card"
              >
                <div className="strip-card-img">
                  {img
                    ? <img src={toMediaUrl(img)} alt={v.title || `${v.make} ${v.model}`} loading="lazy" />
                    : <div className="strip-placeholder"><CarIcon /></div>
                  }
                  <div className="strip-card-badge">
                    {statusBadge(v.status)}
                  </div>
                </div>

                <div className="strip-card-body">
                  <p className="strip-card-meta">
                    {[v.make, v.model, v.year].filter(Boolean).join(' · ') || 'Vehicle'}
                    {v.mileage != null && ` · ${Number(v.mileage).toLocaleString()} km`}
                  </p>
                  <h3 className="strip-card-title">{v.title || `${v.make} ${v.model} ${v.year}`}</h3>

                  <div className="strip-card-footer">
                    <div>
                      <p className="strip-card-bid-label">Direct Export Price</p>
                      <p className="strip-card-bid">
                        USD {price > 0 ? price.toLocaleString() : 'Inquire for Price'}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-xs font-semibold text-amber-500">
                      View Specs →
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <p className="strip-hint">Hover to pause · Click any vehicle to inspect full specifications</p>
    </section>
  )
}
