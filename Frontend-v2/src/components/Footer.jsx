import { Link } from 'react-router-dom'
import { DEALER_CONFIG } from '../config/appConfig'
import TaproLogo from './TaproLogo'

export default function Footer() {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#111111] text-[#D8D8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr_1fr]">
          
          {/* Brand & Japanese Export License */}
          <div>
            <div className="mb-4 inline-block">
              <img
                src="/taproauto_logo_white.png"
                alt="TAPROAUTO"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#D8D8D8]/80 max-w-sm leading-relaxed mb-4">
              Direct Japanese vehicle procurement and export partner. Sourcing quality passenger vehicles from Japan to verified buyers worldwide.
            </p>
            <div className="text-[11px] font-mono text-[#D8D8D8]/60">
              Yokohama Port Shipping Terminal · Tokyo Operations Desk
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Export Desk
            </p>
            <div className="grid gap-2 text-xs">
              <Link to="/" className="text-[#D8D8D8] hover:text-white transition-colors">Home Desk</Link>
              <Link to="/vehicles" className="text-[#D8D8D8] hover:text-white transition-colors">Vehicle Inventory</Link>
              <Link to="/about" className="text-[#D8D8D8] hover:text-white transition-colors">Inspection &amp; Grading</Link>
              <Link to="/contact" className="text-[#D8D8D8] hover:text-white transition-colors">Regional Sales Desks</Link>
              <Link to="/register" className="text-[#D01F26] hover:underline font-bold">Buyer Registration</Link>
            </div>
          </div>

          {/* Official Japanese Contact Desk */}
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Operations &amp; Support
            </p>
            <ul className="space-y-2 text-xs text-[#D8D8D8]/80">
              <li>1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064, Japan</li>
              <li>Dispatch Hours: Mon–Sat, 09:00–19:00 JST</li>
              <li>
                Hotline: <a href="tel:+81364267620" className="text-white hover:underline">+81 3-6426-7620</a>
              </li>
              <li>
                Sales Desk: <a href={`mailto:${DEALER_CONFIG.email}`} className="text-white hover:underline">{DEALER_CONFIG.email}</a>
              </li>
              <li>
                WhatsApp: <a href={`https://wa.me/${DEALER_CONFIG.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#D01F26] font-bold hover:underline">Direct WhatsApp Concierge</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#D8D8D8]/50 gap-3">
          <span>&copy; {new Date().getFullYear()} TAPRO AUTO CO., LTD. All rights reserved.</span>
          <span>Verified Japanese Vehicle Exporter · Tokyo, Japan</span>
        </div>
      </div>
    </footer>
  )
}
