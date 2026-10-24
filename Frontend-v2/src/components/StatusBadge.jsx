const colours = {
  draft:    'bg-[#FAF8F5] text-[#555555] border border-[#EBEBEB]',
  active:   'bg-emerald-50 text-emerald-800 border border-emerald-200',
  ended:    'bg-[#FAF8F5] text-[#777777] border border-[#EBEBEB]',
  listed:   'bg-white text-[#1A1A1A] border border-[#D8D8D8]',
  sold:     'bg-[#D01F26]/10 text-[#D01F26] border border-[#D01F26]/20 font-bold',
  pending:  'bg-amber-50 text-amber-800 border border-amber-200',
  verified: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${colours[status] ?? 'bg-[#FAF8F5] text-[#555555] border border-[#EBEBEB]'}`}>
      {status}
    </span>
  )
}
