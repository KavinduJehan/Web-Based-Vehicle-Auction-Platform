import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listVehicles, deleteVehicle } from '../../api/vehicles'
import { listAuctions, deleteAuction } from '../../api/auctions'
import { listUsers, setStatus } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'

const TABS = ['Vehicles', 'Auctions', 'Users']

export default function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
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

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8D8D8]">
          <div>
            <p className="text-[11px] font-mono tracking-widest text-[#D01F26] uppercase font-bold">Administration & Operations</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/reports"
              className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors inline-flex items-center gap-1.5 shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Reports
            </Link>
            <Link to="/admin/vehicles/new"
              className="btn-tapro-red text-xs px-4 py-2.5 inline-flex items-center gap-1.5 shadow-xs">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Vehicle
            </Link>
            <Link to="/admin/auctions/new"
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors inline-flex items-center gap-1.5 shadow-xs">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Auction
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-white border border-[#D8D8D8] hover:border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {flash && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-3.5 text-sm flex items-center justify-between">
            <span>{flash}</span>
            <button onClick={() => setFlash('')} className="text-emerald-600 hover:text-emerald-900 ml-2 inline-flex items-center">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D8D8D8] rounded max-w-fit shadow-xs">
          {TABS.map(t => (
            <button
              key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                tab === t
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-[#FAF8F5]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-[#D01F26] rounded p-3.5 text-sm">{error}</div>}

        {loading && <Spinner />}

        {/* ── Vehicles tab ── */}
        {!loading && tab === 'Vehicles' && (
          <div className="bg-white border border-[#D8D8D8] rounded shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">ID</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Vehicle / Make Model Year</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Starting Price</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Status</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {vehicles.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-[#777777]">No vehicles in inventory database.</td></tr>
                  )}
                  {vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[#777777]">#{v.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                        {v.title || `${v.make} ${v.model} ${v.year}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1A1A]">USD {Number(v.starting_price).toLocaleString()}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={v.status} /></td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link to={`/admin/vehicles/${v.id}/edit`}
                            className="bg-[#FAF8F5] hover:bg-[#1A1A1A] hover:text-white border border-[#D8D8D8] text-[#1A1A1A] px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                            Edit
                          </Link>
                          <button onClick={() => handleDeleteVehicle(v.id)}
                            className="hover:bg-red-50 text-[#D01F26] border border-red-200 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Auctions tab ── */}
        {!loading && tab === 'Auctions' && (
          <div className="bg-white border border-[#D8D8D8] rounded shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">ID</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Title</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Status</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Ends At</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {auctions.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-[#777777]">No active or scheduled auctions.</td></tr>
                  )}
                  {auctions.map(a => (
                    <tr key={a.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[#777777]">#{a.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{a.title}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3.5 px-4 text-[#555555] text-xs font-mono">
                        {a.ends_at ? new Date(a.ends_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link to={`/auctions/${a.id}`}
                            className="bg-[#FAF8F5] hover:bg-[#1A1A1A] hover:text-white border border-[#D8D8D8] text-[#1A1A1A] px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                            View
                          </Link>
                          <Link to={`/admin/auctions/${a.id}/edit`}
                            className="bg-[#FAF8F5] hover:bg-[#1A1A1A] hover:text-white border border-[#D8D8D8] text-[#1A1A1A] px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                            Edit
                          </Link>
                          <button onClick={() => handleDeleteAuction(a.id)}
                            className="hover:bg-red-50 text-[#D01F26] border border-red-200 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users tab ── */}
        {!loading && tab === 'Users' && (
          <div className="bg-white border border-[#D8D8D8] rounded shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">ID</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Name</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Email</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Role</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777]">Status</th>
                    <th className="py-3 px-4 text-[11px] font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-[#777777]">No registered buyers or users.</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-[#777777]">#{u.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{u.name}</td>
                      <td className="py-3.5 px-4 text-[#555555] font-mono text-xs">{u.email}</td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-[#1A1A1A]">{u.role}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={u.verificationStatus} /></td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          <div className="inline-flex items-center gap-2">
                            {u.verificationStatus !== 'verified' && (
                              <button
                                onClick={() => handleSetStatus(u.id, 'verified')}
                                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors"
                              >
                                Verify
                              </button>
                            )}
                            {u.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() => handleSetStatus(u.id, 'rejected')}
                                className="hover:bg-red-50 text-[#D01F26] border border-red-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors"
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
          </div>
        )}
      </div>
    </div>
  )
}

