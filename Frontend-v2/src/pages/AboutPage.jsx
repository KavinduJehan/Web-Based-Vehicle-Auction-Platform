import { Link } from 'react-router-dom'
import { DEALER_CONFIG } from '../config/appConfig'

export default function AboutPage() {
  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen">
      
      {/* ── ABOUT HERO (With Port Car Background at Reduced Opacity) ── */}
      <section className="bg-[#1A1A1A] border-b border-[#2C2C2C] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Previous Landing Page Port Background with Less Opacity */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_port_car.jpg"
            alt="Yokohama Port Operations"
            className="w-full h-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]/90" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242424] border border-[#333333] text-[11px] font-mono tracking-widest text-[#D8D8D8] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D01F26]" />
            JAPAN TO THE WORLD
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            About <span className="text-white">TAPRO</span><span className="text-[#D01F26]">AUTO</span>
          </h1>

          <p className="text-base sm:text-lg text-[#D8D8D8] max-w-2xl mx-auto leading-relaxed font-normal">
            Connecting Japanese vehicles to the world with trust, transparency, and expertise.
          </p>
        </div>
      </section>

      {/* ── OUR MISSION & STATS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="bg-white border border-[#D8D8D8] rounded-lg p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Mission Statement (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
                OUR PHILOSOPHY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                To provide global buyers with a reliable and transparent platform to access high-quality Japanese vehicles, and to make the export process simple, secure, and completely dependable.
              </p>
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed pt-1">
                Founded and operated out of Yokohama and Tokyo, TAPROAUTO bridges the gap between Japanese automotive quality and international buyers with dedicated personal support.
              </p>
            </div>

            {/* Stat Counters (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-3 text-center border-t lg:border-t-0 lg:border-l border-[#D8D8D8] pt-6 lg:pt-0 lg:pl-8">
              <div className="p-3 bg-[#FAF8F5] border border-[#EBEBEB] rounded-lg">
                <span className="block text-xl sm:text-2xl font-black text-[#1A1A1A] font-mono">100%</span>
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#777777] uppercase tracking-wider mt-1">Direct Sourcing</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#EBEBEB] rounded-lg">
                <span className="block text-xl sm:text-2xl font-black text-[#D01F26] font-mono">Verified</span>
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#777777] uppercase tracking-wider mt-1">Inspections</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#EBEBEB] rounded-lg">
                <span className="block text-xl sm:text-2xl font-black text-[#1A1A1A] font-mono">RoRo/FCL</span>
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#777777] uppercase tracking-wider mt-1">Port Dispatch</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4 CORE VALUE PILLARS (With Clean Red Icons as shown in Mockup) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          
          <div className="bg-white p-6 rounded border border-[#D8D8D8] hover:border-[#D01F26] transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-[#D01F26]/10 flex items-center justify-center text-[#D01F26] mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-base mb-2">Direct Vehicle Sourcing</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Unrivaled inventory access across Japan. Every unit pre-inspected and verified before international dispatch.
            </p>
          </div>

          <div className="bg-white p-6 rounded border border-[#D8D8D8] hover:border-[#D01F26] transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-[#D01F26]/10 flex items-center justify-center text-[#D01F26] mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-base mb-2">Trusted &amp; Transparent</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              No hidden fees or ambiguous condition ratings. Comprehensive translated inspection sheets and clear FOB pricing.
            </p>
          </div>

          <div className="bg-white p-6 rounded border border-[#D8D8D8] hover:border-[#D01F26] transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-[#D01F26]/10 flex items-center justify-center text-[#D01F26] mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-base mb-2">Global Export Support</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Full vessel logistics, customs clearance, port bonded storage, and tracked international sea freight.
            </p>
          </div>

          <div className="bg-white p-6 rounded border border-[#D8D8D8] hover:border-[#D01F26] transition-all duration-200">
            <div className="w-12 h-12 rounded-full bg-[#D01F26]/10 flex items-center justify-center text-[#D01F26] mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-base mb-2">Professional Team</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Experienced Japanese export coordinators and bilingual customer managers at your disposal 24/7.
            </p>
          </div>

        </div>

        {/* ── Regional Sales Management & Country Desks ── */}
        <div className="mt-14 mb-12">
          <div className="text-center sm:text-left mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
              GLOBAL PRESENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Regional Sales Managers
            </h2>
            <p className="text-sm text-[#555555] mt-1 max-w-2xl">
              Dedicated regional managers providing localized consultation, logistics coordination, and direct support for buyers in Africa, Asia, and Europe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Malawi (Bashir Umar Sumaili) */}
            <div className="bg-white rounded-lg border-2 border-[#D01F26]/30 hover:border-[#D01F26] shadow-sm p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="/team/bashir_umar.jpg"
                    alt="Bashir Umar Sumaili"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#D01F26] shadow-sm"
                  />
                  <div>
                    <span className="inline-block bg-[#D01F26]/10 text-[#D01F26] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5 border border-[#D01F26]/20">
                      MW MALAWI DESK
                    </span>
                    <h3 className="text-sm font-black text-[#1A1A1A]">
                      Bashir Umar Sumaili
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Sales Manager – Malawi
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <p><strong>Cell:</strong> +265 999 224 766 / +265 886 000 844</p>
                  <p><strong>Road:</strong> M1 Road, Dedza post office 22, DEDZA DIP, Malawi</p>
                  <p><strong>Email:</strong> <a href="mailto:bashirumarsumaili@gmail.com" className="text-[#D01F26] hover:underline font-mono">bashirumarsumaili@gmail.com</a></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAEAEA]">
                <a
                  href="https://wa.me/265999224766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-block"
                >
                  WhatsApp Malawi Desk
                </a>
              </div>
            </div>

            {/* Card 2: Japan Desk */}
            <div className="bg-white rounded-lg border border-[#D8D8D8] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono border border-[#D8D8D8]">
                    JP DESK
                  </div>
                  <div>
                    <span className="inline-block bg-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5">
                      JP JAPAN DESK
                    </span>
                    <h3 className="text-sm font-black text-[#1A1A1A]">
                      Tokyo Headquarters
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Sales Manager – Japan Desk
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <p><strong>Tel:</strong> +81 3-6426-7620</p>
                  <p><strong>Yard:</strong> Minato Terminal, Yokohama Port</p>
                  <p><strong>Email:</strong> <a href="mailto:sales@taproauto.com" className="text-[#D01F26] hover:underline font-mono">sales@taproauto.com</a></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAEAEA]">
                <span className="text-[11px] font-mono text-[#888888] block text-center py-1">
                  Representative profile pending update
                </span>
              </div>
            </div>

            {/* Card 3: UK & Europe Desk */}
            <div className="bg-white rounded-lg border border-[#D8D8D8] shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono border border-[#D8D8D8]">
                    UK DESK
                  </div>
                  <div>
                    <span className="inline-block bg-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5">
                      GB UK &amp; EUROPE
                    </span>
                    <h3 className="text-sm font-black text-[#1A1A1A]">
                      UK Transit Desk
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Sales Manager – UK &amp; Europe
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <p><strong>Tel:</strong> +44 20 7946 0912</p>
                  <p><strong>Port:</strong> Southampton Port Facility</p>
                  <p><strong>Email:</strong> <a href="mailto:uk-desk@taproauto.com" className="text-[#D01F26] hover:underline font-mono">uk-desk@taproauto.com</a></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAEAEA]">
                <span className="text-[11px] font-mono text-[#888888] block text-center py-1">
                  Representative profile pending update
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── COMPANY PROFILE & LOGISTICS FACILITY DETAILS ── */}
        <div className="mt-12 bg-white border border-[#D8D8D8] rounded-lg p-8 sm:p-10">
          <div className="border-b border-[#E8E8E8] pb-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
                LEGAL REGISTRATION &amp; CORPORATE INFO
              </span>
              <h3 className="text-xl font-black text-[#1A1A1A] mt-1">Tapro Japan Co., Ltd.</h3>
            </div>
            <span className="text-xs font-mono bg-[#FAF8F5] border border-[#D8D8D8] px-3 py-1 rounded text-[#555555]">
              Est. Tokyo, Japan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
            <div className="space-y-4">
              <div>
                <span className="block font-bold text-[#1A1A1A]">Registered Office Address:</span>
                <span className="text-[#555555]">1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064, Japan</span>
              </div>
              <div>
                <span className="block font-bold text-[#1A1A1A]">Port Operations &amp; Yard:</span>
                <span className="text-[#555555]">Minato Terminal 3, Yokohama Port, Kanagawa Prefecture</span>
              </div>
              <div>
                <span className="block font-bold text-[#1A1A1A]">Direct Telephone:</span>
                <span className="text-[#555555] font-mono">+81 3-6426-7620</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block font-bold text-[#1A1A1A]">Official Email:</span>
                <span className="text-[#555555] font-mono">sales@taproauto.com / info@taprojapan.co.jp</span>
              </div>
              <div>
                <span className="block font-bold text-[#1A1A1A]">Inspection Standards:</span>
                <span className="text-[#555555]">Comprehensive Multi-Point Physical Check &amp; Photographic Verification</span>
              </div>
              <div>
                <span className="block font-bold text-[#1A1A1A]">Operational Hours:</span>
                <span className="text-[#555555]">Monday – Friday: 09:00 – 18:00 JST (Japan Standard Time)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8E8E8] flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#777777]">
              Need direct assistance with an upcoming vehicle import order?
            </p>
            <div className="flex gap-3">
              <Link to="/contact" className="btn-tapro-red text-xs py-2 px-5">
                Contact Sales Desk
              </Link>
              <Link to="/vehicles" className="btn-outline-silver text-xs py-2 px-4">
                Explore Stock
              </Link>
            </div>
          </div>
        </div>

      </section>

    </div>
  )
}
