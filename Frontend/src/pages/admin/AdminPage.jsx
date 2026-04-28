import { Link, useLocation } from 'react-router-dom'

const ACTIONS = [
  {
    to: '/admin/vehicles/new',
    label: 'Add Vehicle',
    description: 'Register a new vehicle to the inventory',
    icon: '🚗',
  },
  {
    to: '/admin/auctions/new',
    label: 'Create Auction',
    description: 'Set up an auction for a listed vehicle',
    icon: '🔨',
  },
]

export default function AdminPage() {
  const location = useLocation()
  const created = location.state?.created

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-6">Manage vehicles, auctions and users.</p>

      {created === 'vehicle' && (
        <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm mb-6">
          Vehicle created successfully.{' '}
          <Link to="/admin/auctions/new" className="font-semibold underline">
            Create an auction for it →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIONS.map(a => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col gap-2"
          >
            <span className="text-3xl">{a.icon}</span>
            <span className="font-semibold text-gray-900">{a.label}</span>
            <span className="text-sm text-gray-500">{a.description}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <h2 className="font-semibold mb-3 text-gray-700">Quick links</h2>
        <div className="flex gap-4 text-sm">
          <Link to="/auctions" className="text-blue-600 hover:underline">View all auctions</Link>
          <Link to="/vehicles" className="text-blue-600 hover:underline">View all vehicles</Link>
        </div>
      </div>
    </div>
  )
}
