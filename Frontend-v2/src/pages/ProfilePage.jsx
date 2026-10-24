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
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D8D8D8] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-[#1A1A1A] text-white flex items-center justify-center font-black text-xl tracking-wider shrink-0 border border-[#2A2A2A]">
              {initials}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
                VERIFIED CLIENT PROFILE
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight mt-0.5">
                {name}
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
                Manage your verified buyer status, vehicle auction allocations, and export access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <StatusBadge status={verificationStatus} />
            <span className="text-xs font-mono font-bold bg-white border border-[#D8D8D8] text-[#1A1A1A] px-3 py-1 rounded capitalize">
              {role}
            </span>
          </div>
        </div>

        {/* 2-Column Enterprise Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Account Details & Actions (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            
            {/* Verification Status Card */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D01F26] font-bold block mb-1">
                ACCESS VERIFICATION
              </span>
              <h2 className="text-base font-black text-[#1A1A1A] leading-tight">
                {status.title}
              </h2>
              <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
                {status.body}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 shadow-xs space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] font-bold block mb-1">
                PORTAL ACTIONS
              </span>
              <Link to="/auctions" className="btn-tapro-red w-full text-xs font-bold py-2.5 rounded text-center block">
                Browse Live Auctions
              </Link>
              <Link to="/vehicles" className="bg-[#1A1A1A] hover:bg-black text-white w-full text-xs font-bold py-2.5 rounded text-center block transition-colors">
                Showroom Inventory
              </Link>
              <Link to="/change-password" className="bg-white border border-[#D8D8D8] hover:bg-[#FAF8F5] text-[#1A1A1A] w-full text-xs font-bold py-2.5 rounded text-center block transition-colors">
                Change Password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white border border-[#D8D8D8] hover:bg-red-50 text-[#D01F26] w-full text-xs font-bold py-2.5 rounded text-center block cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Registered Credentials */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777777] font-bold block">
                REGISTERED DETAILS
              </span>
              <div className="border-t border-[#EAEAEA] pt-2 flex justify-between">
                <span className="text-[#777777] font-medium">Full Name</span>
                <span className="font-bold text-[#1A1A1A]">{name}</span>
              </div>
              <div className="border-t border-[#EAEAEA] pt-2 flex justify-between">
                <span className="text-[#777777] font-medium">Email</span>
                <span className="font-mono text-[#1A1A1A] font-semibold">{email}</span>
              </div>
              <div className="border-t border-[#EAEAEA] pt-2 flex justify-between">
                <span className="text-[#777777] font-medium">Account Role</span>
                <span className="font-mono text-[#1A1A1A] uppercase font-bold">{role}</span>
              </div>
            </div>

          </aside>

          {/* Right Column: Portfolio & Won Auctions (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#D8D8D8] rounded p-4 text-center shadow-xs">
                <div className="text-3xl font-black text-[#1A1A1A] font-mono">{wonAuctions.length}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777] font-bold mt-1">Lots Won</div>
              </div>
              <div className="bg-white border border-[#D8D8D8] rounded p-4 text-center shadow-xs">
                <div className="text-2xl font-black text-[#D01F26] font-mono">USD {totalWonValue.toLocaleString()}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777] font-bold mt-1">Total Procurement</div>
              </div>
              <div className="bg-white border border-[#D8D8D8] rounded p-4 text-center shadow-xs">
                <div className="text-2xl font-black text-[#1A1A1A] font-mono capitalize">{verificationStatus === 'verified' ? 'Active' : 'Pending'}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#777777] font-bold mt-1">Bidding Status</div>
              </div>
            </div>

            {/* Won Auctions Section */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
                    ALLOCATED LOTS
                  </span>
                  <h2 className="text-base font-black text-[#1A1A1A] mt-0.5">
                    Won Vehicle Auctions
                  </h2>
                </div>
                <Link to="/auctions" className="text-xs font-bold text-[#D01F26] hover:underline font-mono">
                  Browse Active Catalog &rarr;
                </Link>
              </div>

              {wonAuctions.length === 0 ? (
                <div className="text-center py-12 bg-[#FAF8F5] border border-[#EBEBEB] rounded">
                  <p className="text-sm font-bold text-[#1A1A1A]">No won auctions recorded</p>
                  <p className="text-xs text-[#777777] mt-1">Your winning vehicle allocations and proforma invoices will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wonAuctions.map((auction) => {
                    const imgs = auction.vehicle_images ?? []
                    const thumb = imgs[0] ?? null
                    const title = auction.title || `${auction.vehicle_make} ${auction.vehicle_model} ${auction.vehicle_year}`

                    return (
                      <Link
                        key={auction.id}
                        to={`/auctions/${auction.id}`}
                        className="bg-white border border-[#D8D8D8] hover:border-[#D01F26] rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors group shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5">
                          {thumb ? (
                            <img
                              src={toMediaUrl(thumb)}
                              alt={title}
                              className="w-16 h-12 object-cover rounded border border-[#D8D8D8] shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-[#1A1A1A] text-white rounded border border-[#2A2A2A] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                              AUTO
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-[#1A1A1A] group-hover:text-[#D01F26] transition-colors leading-snug">
                              {title}
                            </h3>
                            <p className="text-[11px] font-mono text-[#777777] mt-0.5">
                              {auction.vehicle_make} {auction.vehicle_model} · {auction.vehicle_year}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <div className="text-right">
                            <div className="text-sm font-mono font-black text-[#D01F26]">
                              USD {Number(auction.winning_amount).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-[#777777]">
                              {auction.ends_at ? new Date(auction.ends_at).toLocaleDateString() : 'Closed'}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#D01F26]">
                            &rarr;
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

          </main>
        </div>

      </div>
    </div>
  )
}
