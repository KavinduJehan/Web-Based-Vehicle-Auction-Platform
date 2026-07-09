import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAuctions } from '../api/auctions'
import CountdownTimer from './CountdownTimer'
import { toMediaUrl } from '../utils/mediaUrl'

function statusDot(status) {
  if (status === 'active') return (
    <span className="strip-live-dot">
      <span />
      Live
    </span>
  )
  if (status === 'draft') return <span className="strip-badge strip-badge--draft">Upcoming</span>
  return <span className="strip-badge strip-badge--ended">Ended</span>
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="strip-placeholder-icon">
      <path d="M5 17H3a2 2 0 01-2-2v-4l2-6h14l2 6v4a2 2 0 01-2 2h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  )
}

export default function LiveAuctionStrip() {
  const [auctions, setAuctions] = useState([])
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)

  useEffect(() => {
    listAuctions()
      .then(res => {
        const all = res.data ?? []
        // active first, then draft, then ended — take up to 10
        const sorted = [
          ...all.filter(a => a.status === 'active'),
          ...all.filter(a => a.status === 'draft'),
          ...all.filter(a => a.status === 'ended'),
        ].slice(0, 10)
        setAuctions(sorted)
      })
      .catch(() => {})
  }, [])

  if (auctions.length === 0) return null

  // Duplicate for seamless infinite scroll
  const items = auctions.length < 4
    ? [...auctions, ...auctions, ...auctions, ...auctions]
    : [...auctions, ...auctions]

  return (
    <section className="strip-shell">
      <div className="strip-header">
        <div>
          <p className="eyebrow">Live Marketplace</p>
          <h2>Active &amp; upcoming auctions</h2>
        </div>
        <Link to="/auctions" className="btn-secondary strip-view-all">
          View all auctions
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
          {items.map((a, i) => {
            const img = a.vehicle_images?.[0]
            const highBid = a.highest_bid != null ? Number(a.highest_bid) : null
            const startPrice = Number(a.starting_price ?? 0)

            return (
              <Link
                key={`${a.id}-${i}`}
                to={`/auctions/${a.id}`}
                className="strip-card"
              >
                <div className="strip-card-img">
                  {img
                    ? <img src={toMediaUrl(img)} alt={a.title} loading="lazy" />
                    : <div className="strip-placeholder"><CarIcon /></div>
                  }
                  <div className="strip-card-badge">
                    {statusDot(a.status)}
                  </div>
                </div>

                <div className="strip-card-body">
                  <p className="strip-card-meta">
                    {[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' · ') || 'Vehicle'}
                  </p>
                  <h3 className="strip-card-title">{a.title}</h3>

                  <div className="strip-card-footer">
                    <div>
                      <p className="strip-card-bid-label">
                        {highBid != null ? 'Current bid' : 'Starting at'}
                      </p>
                      <p className="strip-card-bid">
                        USD {(highBid ?? startPrice).toLocaleString()}
                      </p>
                    </div>
                    {a.status === 'active' && a.ends_at && (
                      <div className="strip-card-timer">
                        <CountdownTimer endsAt={a.ends_at} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <p className="strip-hint">Hover to pause · Click any card to bid</p>
    </section>
  )
}
