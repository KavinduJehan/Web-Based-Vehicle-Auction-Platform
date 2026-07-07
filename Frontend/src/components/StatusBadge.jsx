const colours = {
  draft:    'bg-slate-100 text-slate-700',
  active:   'bg-emerald-100 text-emerald-800',
  ended:    'bg-rose-100 text-rose-700',
  listed:   'bg-sky-100 text-sky-700',
  sold:     'bg-amber-100 text-amber-700',
  pending:  'bg-amber-100 text-amber-800',
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
