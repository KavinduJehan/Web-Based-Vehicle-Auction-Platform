import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMe } from '../api/users'
import { getMyWonAuctions } from '../api/auctions'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'

export default function ProfilePage() {
  const { user: jwtUser } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [wonAuctions, setWon]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

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

  if (loading) return <Spinner />
  if (error)   return (
    <div className="p-12 text-center">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  )

  const { name, email, role, verificationStatus: verification_status } = profile

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Account card */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        {/* Avatar initial */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {name ? name[0].toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <hr />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Role</p>
            <span className="capitalize font-medium text-gray-700">{role}</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Account Status</p>
            <StatusBadge status={verification_status} />
          </div>
        </div>

        {verification_status === 'pending' && (
          <div className="bg-yellow-50 text-yellow-800 rounded-lg p-3 text-sm">
            Your account is awaiting admin verification. You will be able to place bids once verified.
          </div>
        )}
        {verification_status === 'rejected' && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
            Your account has been rejected. Please contact support.
          </div>
        )}
        {verification_status === 'verified' && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm">
            Your account is verified. You can browse and bid on active auctions.
          </div>
        )}
      </div>

      {/* Won auctions */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Won Auctions</h2>
        {wonAuctions.length === 0 ? (
          <p className="text-sm text-gray-500">You haven't won any auctions yet.</p>
        ) : (
          <div className="space-y-3">
            {wonAuctions.map(a => {
              const imgs = a.vehicle_images ?? []
              const thumb = imgs[0] ?? null
              return (
                <Link
                  key={a.id}
                  to={`/auctions/${a.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  {thumb ? (
                    <img src={thumb} alt={a.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🚗</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {a.title || `${a.vehicle_make} ${a.vehicle_model} ${a.vehicle_year}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.vehicle_make} {a.vehicle_model} · {a.vehicle_year}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">
                      Winning bid: LKR {Number(a.winning_amount).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {a.ends_at ? new Date(a.ends_at).toLocaleDateString() : ''}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
