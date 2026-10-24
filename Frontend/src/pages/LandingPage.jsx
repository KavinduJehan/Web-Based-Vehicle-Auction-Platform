import { Link } from 'react-router-dom'
import heroImage from '../assets/auction-hero.png'
import { useAuth } from '../context/AuthContext'
import LiveAuctionStrip from '../components/LiveAuctionStrip'
import FeaturedVehiclesStrip from '../components/FeaturedVehiclesStrip'
import { isAuctionEnabled, DEALER_CONFIG } from '../config/appConfig'

// ── AUCTION MODE HIGHLIGHTS ──────────────────────────────────────────────────
const auctionMetrics = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    value: '24/7',
    label: 'Auction Access',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    value: 'JPN',
    label: 'Export Workflow',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    value: '100%',
    label: 'Verified Bidding',
  },
]

const auctionPillars = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    kicker: 'Buyer Access',
    title: 'Verified accounts before the first bid',
    body: 'Every buyer enters through a controlled approval process, reducing fake offers and protecting serious participants.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    kicker: 'Auction Control',
    title: 'Timed bidding with transparent rules',
    body: 'Auction windows, reserve prices, bid increments, and winner decisions stay visible and traceable from one workflow.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    kicker: 'Export Readiness',
    title: 'Vehicle details built for cross-border decisions',
    body: 'Specifications, images, and status signals help buyers evaluate stock quickly before committing capital.',
  },
]

const auctionSteps = [
  { text: 'Register a buyer account' },
  { text: 'Wait for admin verification' },
  { text: 'Review active vehicle auctions' },
  { text: 'Place qualified bids and track outcomes' },
]

// ── SHOWROOM / DEALERSHIP HIGHLIGHTS ─────────────────────────────────────────
const showroomMetrics = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    value: '100%',
    label: 'Inspected & Certified',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    value: 'JPN',
    label: 'Direct Port Dispatch',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="metric-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.6-3.091H7.5A3.75 3.75 0 0 1 3.75 13.5v-3.75a3.75 3.75 0 0 1 3.75-3.75h10.5c.783 0 1.517.24 2.128.653Z" />
      </svg>
    ),
    value: '24/7',
    label: 'Concierge Support',
  },
]

const showroomPillars = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    kicker: 'Condition Guarantee',
    title: 'Certified multi-point pre-shipment inspection',
    body: 'Every vehicle undergoes strict mechanical, diagnostic, and cosmetic grading before listed in our showroom.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    kicker: 'Direct Pricing',
    title: 'Transparent export prices with zero surprise fees',
    body: 'Clear FOB & CIF pricing structures. No bidding pressure, no hidden dealer premiums—what you see is what you pay.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="feature-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    kicker: 'Worldwide Logistics',
    title: 'Full export documentation and port dispatch',
    body: 'We manage Japanese customs deregistration, bill of lading documentation, and insured RoRo or container shipping.',
  },
]

const showroomSteps = [
  { text: 'Register your buyer profile for private stock alerts' },
  { text: 'Explore our certified showroom & detailed specs' },
  { text: 'Connect with your sales specialist on WhatsApp' },
  { text: 'Confirm shipping & track vehicle to your destination port' },
]

export default function LandingPage() {
  const { user, isAdmin } = useAuth()
  const accountPath = isAdmin ? '/admin' : '/profile'

  const activeMetrics = isAuctionEnabled ? auctionMetrics : showroomMetrics
  const activePillars = isAuctionEnabled ? auctionPillars : showroomPillars
  const activeSteps   = isAuctionEnabled ? auctionSteps   : showroomSteps

  const whatsappHref = `https://wa.me/${DEALER_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${DEALER_CONFIG.name}, I am visiting your website showroom and would like to inquire about available vehicle stock.`
  )}`

  return (
    <div className="landing-page">

      {/* ── Full-bleed Hero ─────────────────── */}
      <div className="hero-bleed">
        <div className="hero-grid-bg" aria-hidden="true" />
        <section className="hero-shell">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              {isAuctionEnabled ? 'Tapro Japan Export Desk' : `${DEALER_CONFIG.name} · Japan Showroom`}
            </p>

            <h1>
              {isAuctionEnabled ? (
                <>
                  Premium vehicle auctions for{' '}
                  <span className="hero-gradient-text">serious export buyers</span>
                </>
              ) : (
                <>
                  Certified Japanese vehicles for{' '}
                  <span className="hero-gradient-text">direct export &amp; discerning buyers</span>
                </>
              )}
            </h1>

            <p className="hero-lede">
              {isAuctionEnabled
                ? 'Taproauto gives international clients a controlled marketplace for Japanese vehicle auctions, with verified buyer access, transparent bidding, and an admin-managed export workflow.'
                : `${DEALER_CONFIG.name} offers international buyers direct access to certified Japanese motor stock, complete inspection records, transparent FOB pricing, and reliable worldwide shipping.`
              }
            </p>

            <div className="hero-trust">
              <span className="hero-trust-dot" />
              Trusted by automotive buyers across 15+ countries · Over 1,200 vehicles delivered
            </div>

            <div className="hero-actions">
              {isAuctionEnabled ? (
                <Link to="/auctions" className="btn-primary hero-btn">
                  View Auctions
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08l3.158-2.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </Link>
              ) : (
                <Link to="/vehicles" className="btn-primary hero-btn">
                  Explore Showroom
                  <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08l3.158-2.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}

              {user ? (
                <Link to={accountPath} className="btn-secondary">
                  {isAdmin ? 'Admin Dashboard' : 'My Account'}
                </Link>
              ) : (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.527.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.377-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.55.719.311 1.28.497 1.718.636.722.229 1.378.197 1.898.119.579-.087 1.783-.728 2.034-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.174L2 22l4.981-1.408A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                  </svg>
                  Instant WhatsApp
                </a>
              )}
            </div>

            <div className="hero-metrics" aria-label="Platform highlights">
              {activeMetrics.map((metric) => (
                <div key={metric.label} className="hero-metric-card">
                  <div className="metric-icon-wrap">{metric.icon}</div>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Vehicle export operation">
            <img src={heroImage} alt="Professional vehicle export facility" />
            <div className="market-ticket">
              <span className="market-ticket-live">
                <span className="market-ticket-dot" />
                {isAuctionEnabled ? 'Live Marketplace' : 'Direct Showroom'}
              </span>
              <strong>{isAuctionEnabled ? 'Verified buyers only' : 'Inspected & Port Ready'}</strong>
            </div>
          </div>
        </section>
      </div>

      {/* ── Below-hero content ─────────────── */}
      <div className="landing-content">
        {isAuctionEnabled ? <LiveAuctionStrip /> : <FeaturedVehiclesStrip />}

        {/* ── Why Clients Trust Us ──────────── */}
        <section className="section-band">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{isAuctionEnabled ? 'Why clients trust it' : 'The Dealership Standard'}</p>
              <h2>
                {isAuctionEnabled
                  ? 'Built for business decisions, not casual browsing'
                  : 'Engineered for seamless international vehicle procurement'}
              </h2>
            </div>
          </div>

          <div className="pillar-grid">
            {activePillars.map((item) => (
              <article key={item.title} className="feature-card">
                <div className="feature-card-icon-wrap">
                  {item.icon}
                </div>
                <p>{item.kicker}</p>
                <h3>{item.title}</h3>
                <span>{item.body}</span>
              </article>
            ))}
          </div>
        </section>

        {/* ── Buyer Journey ─────────────────── */}
        <section className="workflow-band">
          <div>
            <p className="eyebrow">Client journey</p>
            <h2>
              {isAuctionEnabled
                ? 'Clear path from registration to winning bid'
                : 'Direct, transparent 4-step export process'}
            </h2>
            <p>
              {isAuctionEnabled
                ? 'The platform keeps the process understandable for clients while giving administrators the control needed to run dependable auction operations.'
                : 'From stock inspection to port containerization, our team handles all technical and logistics hurdles on your behalf.'}
            </p>
          </div>

          <ol className="workflow-list">
            {activeSteps.map((step, index) => (
              <li key={step.text}>
                <span className="workflow-step-num">{String(index + 1).padStart(2, '0')}</span>
                <div className="workflow-step-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="workflow-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <strong>{step.text}</strong>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CTA ──────────────────────────── */}
        <section className="cta-band">
          <div>
            <p className="eyebrow">Start with confidence</p>
            <h2>
              {user
                ? (isAuctionEnabled ? 'Continue managing your auction activity.' : 'Browse newly added showroom arrivals.')
                : (isAuctionEnabled ? 'Register today and join the verified buyer network.' : 'Register for priority stock alerts & full inspection sheets.')}
            </h2>
          </div>
          <div className="cta-actions">
            {user ? (
              <>
                <Link to={isAuctionEnabled ? '/auctions' : '/vehicles'} className="btn-primary">
                  {isAuctionEnabled ? 'Browse Auctions' : 'Explore Showroom'}
                </Link>
                <Link to={accountPath} className="btn-secondary">
                  {isAdmin ? 'Admin Dashboard' : 'Open Account'}
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Create Client Account</Link>
                <Link to="/login" className="btn-secondary">Sign In</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
