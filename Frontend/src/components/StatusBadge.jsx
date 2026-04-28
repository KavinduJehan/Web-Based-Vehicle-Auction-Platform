const colours = {
  draft:    'bg-gray-100 text-gray-700',
  active:   'bg-green-100 text-green-800',
  ended:    'bg-red-100 text-red-700',
  listed:   'bg-blue-100 text-blue-700',
  sold:     'bg-purple-100 text-purple-700',
  pending:  'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${colours[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
