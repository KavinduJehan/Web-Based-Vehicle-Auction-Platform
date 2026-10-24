export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0f2a43] rounded-full animate-spin" />
    </div>
  )
}
