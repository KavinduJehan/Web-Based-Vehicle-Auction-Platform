import { Link } from 'react-router-dom'
import heroImage from '../assets/auction-hero.png'
import { useAuth } from '../context/AuthContext'
import LiveAuctionStrip from '../components/LiveAuctionStrip'

const metrics = [
  { value: '24/7', label: 'auction access' },
  { value: 'JPN', label: 'export workflow' },
  { value: '100%', label: 'verified bidding' },
]

const pillars = [
  {
    kicker: 'Buyer Access',
    title: 'Verified accounts before the first bid',
    body: 'Every buyer enters through a controlled approval process, reducing fake offers and protecting serious participants.',
  },
  {
    kicker: 'Auction Control',
    title: 'Timed bidding with transparent rules',
    body: 'Auction windows, reserve prices, bid increments, and winner decisions stay visible and traceable from one workflow.',
  },
  {
    kicker: 'Export Readiness',
    title: 'Vehicle details built for cross-border decisions',
    body: 'Specifications, images, and status signals help buyers evaluate stock quickly before committing capital.',
  },
]

const steps = [
  'Register a buyer account',
  'Wait for admin verification',
  'Review active vehicle auctions',
  'Place qualified bids and track outcomes',
]

export default function LandingPage() {
  const { user, isAdmin } = useAuth()
  const accountPath = isAdmin ? '/admin' : '/profile'

  return (
    <div className="landing-page">
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Tapro Japan Export Desk</p>
          <h1>Premium vehicle auctions for serious export buyers</h1>
          <p className="hero-lede">
            Taproauto gives international clients a controlled marketplace for Japanese vehicle auctions,
            with verified buyer access, transparent bidding, and an admin-managed export workflow.
          </p>

          <div className="hero-actions">
            <Link to="/auctions" className="btn-primary">View Auctions</Link>
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
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-label="Vehicle auction export operation">
          <img src={heroImage} alt="Professional vehicle auction facility with export bidding screens" />
          <div className="market-ticket">
            <span>Live Marketplace</span>
            <strong>Verified buyers only</strong>
          </div>
        </div>
      </section>

      <LiveAuctionStrip />

      <section className="section-band">
        <div className="section-heading">
          <p className="eyebrow">Why clients trust it</p>
          <h2>Built for business decisions, not casual browsing</h2>
        </div>

        <div className="pillar-grid">
          {pillars.map((item) => (
            <article key={item.title} className="feature-card">
              <p>{item.kicker}</p>
              <h3>{item.title}</h3>
              <span>{item.body}</span>
            </article>
          ))}
        </div>
      </section>

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
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

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
  )
}
