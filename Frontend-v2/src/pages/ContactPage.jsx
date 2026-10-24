import { useState } from 'react'
import { DEALER_CONFIG } from '../config/appConfig'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  })
  const [sent, setSent] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`TAPROAUTO Sourcing Inquiry from ${form.name}${form.company ? ' (' + form.company + ')' : ''}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Company: ${form.company || 'N/A'}\n` +
      `Phone/WhatsApp: ${form.phone || 'N/A'}\n\n` +
      `Message:\n${form.message}`
    )
    window.location.href = `mailto:${DEALER_CONFIG.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-[#D8D8D8] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-widest">
              DIRECT DESK &amp; REGIONAL LIAISON
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Contact &amp; Regional Desks
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1 max-w-2xl">
              Connect directly with our dedicated regional sales managers for on-the-ground support, or reach our central export operations in Tokyo.
            </p>
          </div>
          <div className="text-xs font-mono text-[#555555] bg-white border border-[#D8D8D8] px-3.5 py-2 rounded self-start md:self-auto font-bold">
            Direct Line: <strong className="text-[#1A1A1A]">+81 3-6426-7620</strong>
          </div>
        </div>

        {/* ── TOP SECTION: REGIONAL SALES MANAGERS (ABOVE THE FOLD) ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-widest block">
                LOCAL MARKET REPRESENTATIVES
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight mt-0.5">
                Regional Sales Managers
              </h2>
            </div>
            <span className="text-xs font-mono text-[#555555] font-bold bg-white border border-[#D8D8D8] px-2.5 py-1 rounded hidden sm:inline-block">
              Direct Support Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Malawi Regional Sales Manager (Bashir Umar Sumaili) */}
            <div className="bg-white border-2 border-[#D01F26] rounded p-5 sm:p-6 shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src="/team/bashir_umar.jpg"
                      alt="Bashir Umar Sumaili"
                      className="w-16 h-16 rounded object-cover border-2 border-[#D01F26] shadow-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-wider mb-0.5">
                      Malawi Regional Desk
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      Bashir Umar Sumaili
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Sales Manager – Malawi
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Cell / WhatsApp:
                    </span>
                    <a href="tel:+265999224766" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-semibold block">
                      +265 999 224 766
                    </a>
                    <a href="tel:+265886000844" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-semibold block">
                      +265 886 000 844
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Road &amp; Postal Address:
                    </span>
                    <p className="leading-relaxed">
                      M1 Road, Dedza Post Office 22<br />
                      DEDZA DIP, Malawi
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Direct Email:
                    </span>
                    <a href="mailto:bashirumarsumaili@gmail.com" className="text-[#D01F26] hover:underline font-mono break-all font-semibold">
                      bashirumarsumaili@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA] flex gap-2">
                <a
                  href="https://wa.me/265999224766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.838.814 2.796.814 3.18 0 5.766-2.586 5.767-5.766.001-3.181-2.585-5.766-5.767-5.766zm3.376 8.21c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.071-.497-1.614-.668-2.673-2.302-2.755-2.411-.08-.109-.648-.863-.648-1.646 0-.782.411-1.168.556-1.328.145-.16.317-.2.423-.2.106 0 .211.001.304.006.098.005.231-.037.362.278.135.324.463 1.13.503 1.213.041.082.068.179.014.288-.055.108-.083.175-.164.271-.082.096-.172.214-.246.287-.082.082-.167.171-.072.335.095.163.424.699.911 1.132.628.557 1.157.73 1.32.812.163.082.259.068.355-.041.096-.109.412-.48.521-.645.109-.164.218-.137.367-.082.149.055.945.445 1.108.527.163.082.272.123.312.191.041.069.041.397-.103.802z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:bashirumarsumaili@gmail.com"
                  className="flex-1 text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors inline-flex items-center justify-center"
                >
                  Email Desk
                </a>
              </div>
            </div>

            {/* Card 2: Japan Operations Desk */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center font-bold text-xs border border-[#D8D8D8]">
                    JP DESK
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#777777] uppercase tracking-wider mb-0.5">
                      Japan Operations Desk
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      Tokyo Headquarters
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Export Desk – Tokyo / Yokohama
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Direct Telephone:
                    </span>
                    <a href="tel:+81364267620" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-semibold block">
                      +81 3-6426-7620
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Operations Address:
                    </span>
                    <p className="leading-relaxed">
                      1-1-14 Kamiikedai, Ota-ku, Tokyo<br />
                      Yokohama Port Commercial Dispatch
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Central Inquiries:
                    </span>
                    <a href={`mailto:${DEALER_CONFIG.email}`} className="text-[#D01F26] hover:underline font-mono break-all font-semibold">
                      {DEALER_CONFIG.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA]">
                <a
                  href={`mailto:${DEALER_CONFIG.email}`}
                  className="w-full text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors block"
                >
                  Contact Japan Desk
                </a>
              </div>
            </div>

            {/* Card 3: United Kingdom & European Desk */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center font-bold text-xs border border-[#D8D8D8]">
                    UK DESK
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#777777] uppercase tracking-wider mb-0.5">
                      UK &amp; Europe Desk
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      UK Logistics Desk
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Logistics Liaison – Southampton
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Hotline:
                    </span>
                    <a href="tel:+442079460912" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-semibold block">
                      +44 20 7946 0912
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      UK Transit Hub:
                    </span>
                    <p className="leading-relaxed">
                      Southampton Port Commercial Terminal<br />
                      Hampshire, United Kingdom
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      European Email:
                    </span>
                    <a href="mailto:uk-desk@taproauto.com" className="text-[#D01F26] hover:underline font-mono break-all font-semibold">
                      uk-desk@taproauto.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA]">
                <a
                  href="mailto:uk-desk@taproauto.com"
                  className="w-full text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors block"
                >
                  Contact UK Desk
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── LOWER SECTION: 2-COLUMN CONTACT FORM & TOKYO HEADQUARTERS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#D8D8D8]">
          
          {/* Left Column: Direct Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <span className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-widest block">
                DIRECT INQUIRY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight mt-0.5">
                Send a Vehicle Sourcing Request
              </h2>
              <p className="text-xs text-[#555555] mt-1">
                Tell us which Japanese model, year range, and destination port you require.
              </p>
            </div>

            {sent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded flex items-center justify-center mx-auto border border-emerald-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A]">Inquiry Prepared</h3>
                <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
                  Your email client should have opened with your request details. You can also reach our sales desk directly at <strong className="text-[#1A1A1A] font-mono">{DEALER_CONFIG.email}</strong>.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="btn-tapro-red text-xs py-2 px-5 mt-2"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                      Your Name <span className="text-[#D01F26]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={onChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                      Business Email <span className="text-[#D01F26]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={onChange}
                      placeholder="importer@company.com"
                      className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                      Company / Organization <span className="text-[#777777] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={onChange}
                      placeholder="e.g. Global Motor Traders"
                      className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                    Vehicle Specifications &amp; Destination Port <span className="text-[#D01F26]">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={onChange}
                    placeholder="Specify Make/Model (e.g. Toyota Land Cruiser 300, Supra), preferred year, fuel type, and target destination port."
                    className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26] resize-y"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-[11px] text-[#777777] font-mono">
                    Direct response within 24 business hours from Tokyo HQ.
                  </p>
                  <button
                    type="submit"
                    className="btn-tapro-red py-2.5 px-6 text-xs font-bold cursor-pointer"
                  >
                    Send Direct Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Tokyo Headquarters & Port Shipping Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Headquarters Card */}
            <div className="bg-white border border-[#D8D8D8] rounded p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#EAEAEA]">
                <div className="w-10 h-10 rounded bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1A1A1A]">Tokyo Headquarters</h3>
                  <p className="text-xs text-[#555555] font-mono">TAPRO CO., LTD. · JAPAN</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#555555]">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#777777] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <strong className="text-[#1A1A1A] block font-semibold">Registered Office:</strong>
                    1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064, Japan
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#777777] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <strong className="text-[#1A1A1A] block font-semibold">Telephone:</strong>
                    <a href="tel:+81364267620" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono">
                      +81 3-6426-7620
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#777777] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <strong className="text-[#1A1A1A] block font-semibold">Direct Desk Email:</strong>
                    <a href={`mailto:${DEALER_CONFIG.email}`} className="text-[#D01F26] hover:underline font-mono">
                      {DEALER_CONFIG.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Maritime Port Logistics Dispatch Info */}
            <div className="bg-[#111111] text-[#D8D8D8] border border-[#2A2A2A] rounded p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D01F26]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h4 className="text-sm font-bold tracking-tight text-white">Direct Port Dispatch</h4>
                </div>
                <span className="text-[10px] font-mono text-[#D8D8D8]/70 uppercase tracking-widest bg-[#222222] px-2 py-0.5 rounded">
                  Yokohama Terminal
                </span>
              </div>
              <p className="text-xs text-[#D8D8D8]/80 leading-relaxed">
                Export vehicles are processed through commercial port terminals in Japan for RoRo and container maritime shipping to destination ports globally.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-[#D8D8D8]/70">
                <div className="bg-[#1A1A1A] p-2.5 rounded border border-[#2A2A2A]">
                  <div className="text-white font-bold">Standard RoRo</div>
                  <div>Direct Vehicle Carrier</div>
                </div>
                <div className="bg-[#1A1A1A] p-2.5 rounded border border-[#2A2A2A]">
                  <div className="text-white font-bold">FCL Container</div>
                  <div>20ft &amp; 40ft Secure Shipping</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
