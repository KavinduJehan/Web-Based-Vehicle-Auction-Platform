import { Link } from 'react-router-dom'
import heroImage from '../assets/auction-hero.png'
import { useAuth } from '../context/AuthContext'
import LiveAuctionStrip from '../components/LiveAuctionStrip'

const metrics = [
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

const pillars = [
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

const steps = [
  {
    text: 'Register a buyer account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="workflow-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    text: 'Wait for admin verification',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="workflow-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    text: 'Review active vehicle auctions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="workflow-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    text: 'Place qualified bids and track outcomes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="workflow-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 2.25c1.845 0 3.542.647 4.872 1.726M12 2.25c-1.845 0-3.542.647-4.872 1.726m9.744 0c.93.94 1.628 2.107 2.016 3.399M7.128 3.976a7.454 7.454 0 0 0-2.016 3.399m0 0A7.5 7.5 0 0 0 4.5 10.5c0 1.217.29 2.367.804 3.382" />
      </svg>
    ),
  },
]

export default function LandingPage() {
  const { user, isAdmin } = useAuth()
  const accountPath = isAdmin ? '/admin' : '/profile'

  return (
    <div className="landing-page">

      {/* ── Full-bleed Hero ─────────────────── */}
      <div className="hero-bleed">
        <div className="hero-grid-bg" aria-hidden="true" />
        <section className="hero-shell">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Tapro Japan Export Desk</p>
            <h1>
              Premium vehicle auctions for{' '}
              <span className="hero-gradient-text">serious export buyers</span>
            </h1>
            <p className="hero-lede">
              Taproauto gives international clients a controlled marketplace for Japanese vehicle auctions,
              with verified buyer access, transparent bidding, and an admin-managed export workflow.
            </p>

            <div className="hero-trust">
              <span className="hero-trust-dot" />
              Trusted by export buyers across 15+ countries
            </div>

            <div className="hero-actions">
              <Link to="/auctions" className="btn-primary hero-btn">
                View Auctions
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L11.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 1 1-1.04-1.08l3.158-2.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
              {user ? (
                <Link to={accountPath} className="btn-secondary">
                  {isAdmin ? 'Admin Dashboard' : 'My Profile'}
                </Link>
              ) : (
                <Link to="/register" className="btn-secondary">Become a Buyer</Link>
              )}
            </div>

            <div className="hero-metrics" aria-label="Platform highlights">
              {metrics.map((metric) => (
                <div key={metric.label} className="hero-metric-card">
                  <div className="metric-icon-wrap">{metric.icon}</div>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Vehicle auction export operation">
            <img src={heroImage} alt="Professional vehicle auction facility with export bidding screens" />
            <div className="market-ticket">
              <span className="market-ticket-live">
                <span className="market-ticket-dot" />
                Live Marketplace
              </span>
              <strong>Verified buyers only</strong>
            </div>
          </div>
        </section>
      </div>

      {/* ── Below-hero content ─────────────── */}
      <div className="landing-content">
        <LiveAuctionStrip />

        {/* ── Why Clients Trust It ──────────── */}
        <section className="section-band">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Why clients trust it</p>
              <h2>Built for business decisions, not casual browsing</h2>
            </div>
          </div>

          <div className="pillar-grid">
            {pillars.map((item) => (
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
            <p className="eyebrow">Buyer journey</p>
            <h2>Clear path from registration to winning bid</h2>
            <p>
              The platform keeps the process understandable for clients while giving administrators the
              control needed to run dependable auction operations.
            </p>
          </div>

          <ol className="workflow-list">
            {steps.map((step, index) => (
              <li key={step.text}>
                <span className="workflow-step-num">{String(index + 1).padStart(2, '0')}</span>
                <div className="workflow-step-icon-wrap">{step.icon}</div>
                <strong>{step.text}</strong>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CTA ──────────────────────────── */}
        <section className="cta-band">
          <div>
            <p className="eyebrow">Start with confidence</p>
            <h2>{user ? 'Continue managing your auction activity.' : 'Register today and join the verified buyer network.'}</h2>
          </div>
          <div className="cta-actions">
            {user ? (
              <>
                <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
                <Link to={accountPath} className="btn-secondary">
                  {isAdmin ? 'Admin Dashboard' : 'Open Profile'}
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Create Account</Link>
                <Link to="/login" className="btn-secondary">Sign In</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
