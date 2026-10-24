import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '../api/users'
import { getMyWonAuctions } from '../api/auctions'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'

const statusCopy = {
  pending: {
    title: 'Verification in review',
    body: 'Your profile is waiting for admin approval. Auction browsing is available, but bidding opens after verification.',
    tone: 'notice',
  },
  rejected: {
    title: 'Verification needs attention',
    body: 'Your account was not approved. Contact Taproauto support to review the next step.',
    tone: 'danger',
  },
  verified: {
    title: 'Buyer account verified',
    body: 'Your account is approved for active auction participation and bid tracking.',
    tone: 'success',
  },
}

export default function ProfilePage() {
  const { user: jwtUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [wonAuctions, setWon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      getMe(),
      getMyWonAuctions().catch(() => ({ data: [] })),
    ])
      .then(([pRes, wRes]) => {
        setProfile(pRes.data)
        setWon(wRes.data ?? [])
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const totalWonValue = useMemo(() => (
    wonAuctions.reduce((sum, item) => sum + Number(item.winning_amount || 0), 0)
  ), [wonAuctions])

  if (loading) return <Spinner />
  if (error) {
    return (
      <div className="page">
        <div className="empty-state">
          <h1>Profile unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const {
    name = 'Buyer',
    email = jwtUser?.email || 'No email available',
    role = jwtUser?.role || 'buyer',
    verificationStatus = 'pending',
  } = profile ?? {}
  const status = statusCopy[verificationStatus] ?? statusCopy.pending
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'B'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="profile-page page">
      <section className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar">{initials}</div>
          <div>
            <p className="eyebrow">Client profile</p>
            <h1>Account Overview</h1>
            <p>Manage your buyer status, auction wins, and account access.</p>
          </div>
        </div>

        <div className="profile-status">
          <StatusBadge status={verificationStatus} />
          <span className="capitalize">{role}</span>
        </div>
      </section>

      <section className="profile-grid">
        <aside className="account-panel">
          <div className={`verification-card ${status.tone}`}>
            <p className="eyebrow">Account status</p>
            <h2>{status.title}</h2>
            <p>{status.body}</p>
          </div>

          <div className="quick-actions">
            <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
            <Link to="/vehicles" className="btn-secondary">View Vehicles</Link>
            <Link to="/change-password" className="btn-secondary">Change Password</Link>
            <button type="button" onClick={handleLogout} className="btn-secondary">Log Out</button>
          </div>

          <dl className="profile-details">
            <div>
              <dt>Name</dt>
              <dd>{name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd className="capitalize">{role}</dd>
            </div>
          </dl>
        </aside>

        <div className="profile-main">
          <div className="portfolio-summary">
            <div>
              <span>{wonAuctions.length}</span>
              <p>Won auctions</p>
            </div>
            <div>
              <span>USD {totalWonValue.toLocaleString()}</span>
              <p>Total winning value</p>
            </div>
            <div>
              <span>{verificationStatus === 'verified' ? 'Open' : 'Limited'}</span>
              <p>Bidding access</p>
            </div>
          </div>

          <section className="wins-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Auction outcomes</p>
                <h2>Won Auctions</h2>
              </div>
              <Link to="/auctions" className="text-link">Find more auctions</Link>
            </div>

            {wonAuctions.length === 0 ? (
              <div className="empty-state compact">
                <h3>No wins yet</h3>
                <p>Your winning vehicles will appear here with bid value, vehicle details, and auction date.</p>
              </div>
            ) : (
              <div className="won-list">
                {wonAuctions.map((auction) => {
                  const imgs = auction.vehicle_images ?? []
                  const thumb = imgs[0] ?? null
                  const title = auction.title || `${auction.vehicle_make} ${auction.vehicle_model} ${auction.vehicle_year}`

                  return (
                    <Link key={auction.id} to={`/auctions/${auction.id}`} className="won-item">
                      {thumb ? (
                          <img src={toMediaUrl(thumb)} alt={title} />
                      ) : (
                        <div className="vehicle-placeholder">AUTO</div>
                      )}
                      <div>
                        <h3>{title}</h3>
                        <p>{auction.vehicle_make} {auction.vehicle_model} / {auction.vehicle_year}</p>
                        <strong>USD {Number(auction.winning_amount).toLocaleString()}</strong>
                      </div>
                      <time>
                        {auction.ends_at ? new Date(auction.ends_at).toLocaleDateString() : 'Closed'}
                      </time>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}
