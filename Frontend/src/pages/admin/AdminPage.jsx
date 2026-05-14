import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listVehicles, deleteVehicle } from '../../api/vehicles'
import { listAuctions, deleteAuction } from '../../api/auctions'
import { listUsers, setStatus } from '../../api/users'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'

const TABS = ['Vehicles', 'Auctions', 'Users']

export default function AdminPage() {
  const location = useLocation()
  const [tab, setTab]         = useState('Vehicles')
  const [vehicles, setVehicles] = useState([])
  const [auctions, setAuctions] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [flash, setFlash]       = useState(location.state?.created ? 'Vehicle created.' : location.state?.updated ? 'Saved.' : '')

  const loadVehicles = useCallback(() =>
    listVehicles({ limit: 100, sortBy: 'created_at', order: 'desc' })
      .then(r => setVehicles(r.data.data ?? r.data)), [])

  const loadAuctions = useCallback(() =>
    listAuctions().then(r => setAuctions(r.data)), [])

  const loadUsers = useCallback(() =>
    listUsers().then(r => setUsers(r.data)), [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const loaders = { Vehicles: loadVehicles, Auctions: loadAuctions, Users: loadUsers }
    loaders[tab]()
      .catch(() => setError(`Failed to load ${tab.toLowerCase()}`))
      .finally(() => setLoading(false))
  }, [tab, loadVehicles, loadAuctions, loadUsers])

  async function handleDeleteVehicle(id) {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return
    await deleteVehicle(id).catch(() => {})
    await loadVehicles()
  }

  async function handleDeleteAuction(id) {
    if (!window.confirm('Delete this auction? This cannot be undone.')) return
    await deleteAuction(id).catch(() => {})
    await loadAuctions()
  }

  async function handleSetStatus(userId, status) {
    try {
      await setStatus(userId, status)
      await loadUsers()
      window.dispatchEvent(new CustomEvent('user-status-changed'))
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to update status')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/vehicles/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Vehicle
          </Link>
          <Link to="/admin/auctions/new"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Auction
          </Link>
        </div>
      </div>

      {flash && (
        <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm mb-4">
          {flash}{' '}
          <button onClick={() => setFlash('')} className="text-green-500 hover:text-green-700 ml-2 text-xs">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {TABS.map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error   && <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>}
      {loading && <Spinner />}

      {/* ── Vehicles tab ── */}
      {!loading && tab === 'Vehicles' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Title / Make Model Year</th>
                <th className="pb-2 pr-4">Starting Price</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No vehicles.</td></tr>
              )}
              {vehicles.map(v => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-400">{v.id}</td>
                  <td className="py-3 pr-4 font-medium">
                    {v.title || `${v.make} ${v.model} ${v.year}`}
                  </td>
                  <td className="py-3 pr-4">USD {Number(v.starting_price).toLocaleString()}</td>
                  <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/vehicles/${v.id}/edit`}
                        className="text-blue-600 hover:underline text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDeleteVehicle(v.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Auctions tab ── */}
      {!loading && tab === 'Auctions' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Ends At</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No auctions.</td></tr>
              )}
              {auctions.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-400">{a.id}</td>
                  <td className="py-3 pr-4 font-medium">{a.title}</td>
                  <td className="py-3 pr-4"><StatusBadge status={a.status} /></td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">
                    {a.ends_at ? new Date(a.ends_at).toLocaleString() : '—'}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link to={`/auctions/${a.id}`}
                        className="text-gray-500 hover:underline text-xs font-medium">View</Link>
                      <Link to={`/admin/auctions/${a.id}/edit`}
                        className="text-blue-600 hover:underline text-xs font-medium">Edit</Link>
                      <button onClick={() => handleDeleteAuction(a.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Users tab ── */}
      {!loading && tab === 'Users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-gray-400">No users.</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-400">{u.id}</td>
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4 capitalize">{u.role}</td>
                  <td className="py-3 pr-4"><StatusBadge status={u.verificationStatus} /></td>
                  <td className="py-3">
                    {u.role !== 'admin' && (
                      <div className="flex gap-2">
                        {u.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleSetStatus(u.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        {u.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleSetStatus(u.id, 'rejected')}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

