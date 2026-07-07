import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Tapro Japan Export Desk</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">TAPROAUTO</h2>
            <p className="mt-3 text-sm text-slate-600 max-w-sm leading-6">
              Professional vehicle auction access for verified buyers, backed by a controlled Japan export workflow.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Platform</p>
            <div className="grid gap-2 text-sm">
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
              <Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link to="/about#contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
              <Link to="/auctions" className="text-slate-600 hover:text-slate-900 transition-colors">Auctions</Link>
              <Link to="/vehicles" className="text-slate-600 hover:text-slate-900 transition-colors">Vehicles</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064</li>
              <li>Mon-Fri, 9:00-18:00 JST</li>
              <li><a href="tel:+81364267620" className="hover:text-slate-900 transition-colors">+81 3-6426-7620</a></li>
              <li><a href="mailto:info@taprojapan.co.jp" className="hover:text-slate-900 transition-colors">info@taprojapan.co.jp</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
