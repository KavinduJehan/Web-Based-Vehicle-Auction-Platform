import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVehicle } from '../api/vehicles'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'
import { DEALER_CONFIG } from '../config/appConfig'
import { useAuth } from '../context/AuthContext'
import Vehicle3DViewer from '../components/Vehicle3DViewer'

const SHIPPING_RATES = {
  'United Kingdom (Southampton)': 1850,
  'United States (Long Beach / Tacoma)': 2400,
  'Australia (Melbourne / Brisbane)': 1750,
  'Kenya (Mombasa)': 1950,
  'UAE (Dubai Jebel Ali)': 1650,
  'New Zealand (Auckland)': 1800,
  'Ireland (Dublin)': 2100,
  'Canada (Vancouver)': 2300,
  'South Africa (Durban)': 1900,
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [view3D, setView3D] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(Object.keys(SHIPPING_RATES)[0])
  const [watchlist, setWatchlist] = useState(false)

  // Inquiry Modal State
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    country: '',
    message: ''
  })

  useEffect(() => {
    getVehicle(id)
      .then(res => setVehicle(res.data))
      .catch(() => setError('Vehicle not found'))
      .finally(() => setLoading(false))
  }, [id])

  const images = vehicle?.images ?? []

  const openLightbox  = (i) => { setActiveIdx(i); setZoomed(false); setLightbox(true) }
  const closeLightbox = ()  => { setLightbox(false); setZoomed(false) }
  const prev = (e) => { e.stopPropagation(); setZoomed(false); setActiveIdx(i => (i - 1 + images.length) % images.length) }
  const next = (e) => { e.stopPropagation(); setZoomed(false); setActiveIdx(i => (i + 1) % images.length) }

  const onKey = useCallback((e) => {
    if (!lightbox) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') setActiveIdx(i => (i - 1 + images.length) % images.length)
    if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % images.length)
  }, [lightbox, images.length])

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  if (loading) return <Spinner />
  if (error || !vehicle) return (
    <div className="p-16 text-center bg-[#F8F6F2] min-h-[60vh] flex flex-col items-center justify-center">
      <p className="text-[#D01F26] font-bold text-lg mb-2">{error || 'Vehicle not found'}</p>
      <Link to="/vehicles" className="btn-outline-silver text-xs py-2 px-4">
        ← Back to Vehicle Listings
      </Link>
    </div>
  )

  const vehicleTitle = vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`
  const priceFob = Number(vehicle.starting_price ?? 0)
  const shippingCost = SHIPPING_RATES[selectedDestination] || 1850
  const estimatedCif = priceFob + shippingCost

  const specs = [
    { label: 'Stock No.', value: `TA-${vehicle.id}` },
    { label: 'Chassis No.', value: vehicle.chassis_number || 'DBA-ZN6-0129' },
    { label: 'Year', value: vehicle.year || '2020' },
    { label: 'Mileage', value: vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} km` : '18,000 km' },
    { label: 'Inspection Grade', value: vehicle.grade || '4.5 / Interior B' },
    { label: 'Engine Capacity', value: vehicle.engine_capacity ? `${vehicle.engine_capacity} cc` : '2,000 cc DOHC' },
    { label: 'Transmission', value: vehicle.transmission || 'Automatic' },
    { label: 'Drive Type', value: vehicle.drive_train || '2WD / RWD' },
    { label: 'Fuel Type', value: vehicle.fuel_type || 'Petrol' },
    { label: 'Color', value: vehicle.color || 'Pearl White' },
    { label: 'Seats', value: vehicle.seats || '5 Seats' },
    { label: 'Port of Origin', value: 'Yokohama Minato Terminal' },
  ]

  const whatsappMessage = `Hello ${DEALER_CONFIG.name}, I am inquiring about Stock #TA-${vehicle.id}: ${vehicle.year} ${vehicle.make} ${vehicle.model} (Chassis: ${vehicle.chassis_number || 'N/A'}). Please confirm availability and CIF shipping quote.`
  const whatsappUrl = `https://wa.me/${DEALER_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

  function handleInquirySubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`Purchase Inquiry: Stock #TA-${vehicle.id} - ${vehicleTitle}`)
    const body = encodeURIComponent(
      `Hello ${DEALER_CONFIG.name} Export Desk,\n\n` +
      `I would like to inquire about the following vehicle:\n` +
      `- Vehicle: ${vehicleTitle}\n` +
      `- Stock No: TA-${vehicle.id}\n` +
      `- Chassis Number: ${vehicle.chassis_number || 'N/A'}\n` +
      `- FOB Price: USD ${priceFob.toLocaleString()}\n` +
      `- Destination Port: ${inquiryForm.country || selectedDestination}\n\n` +
      `My Contact Details:\n` +
      `- Name: ${inquiryForm.name}\n` +
      `- Email: ${inquiryForm.email}\n` +
      `- Phone/WhatsApp: ${inquiryForm.phone}\n\n` +
      `Requirements / Message:\n` +
      `${inquiryForm.message || 'Please send CIF shipping quotation, inspection sheet translation, and payment wire instructions.'}\n`
    )
    window.location.href = `mailto:${DEALER_CONFIG.email}?subject=${subject}&body=${body}`
    setInquirySent(true)
  }

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between text-xs font-mono">
          <Link to="/vehicles" className="inline-flex items-center gap-1.5 text-[#555555] hover:text-[#D01F26] font-bold transition-colors">
            ← Back to Vehicle Listings
          </Link>
          <span className="text-[#777777]">Stock Reference: <strong>TA-{vehicle.id}</strong></span>
        </div>

        {/* ── Top Section: Photos/3D (Left 7 Cols) + Summary & CTAs (Right 5 Cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          
          {/* Left Column: Visual Media & 360 View (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            
            <div className="relative rounded border border-[#D8D8D8] bg-[#1A1A1A] overflow-hidden shadow-sm">
              {view3D ? (
                <Vehicle3DViewer />
              ) : (
                <div
                  className="relative group cursor-zoom-in aspect-[4/3] w-full"
                  onClick={() => openLightbox(activeIdx)}
                >
                  {images[activeIdx] ? (
                    <img
                      src={toMediaUrl(images[activeIdx])}
                      alt={vehicleTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#777777] font-mono text-xs">
                      [INSPECTION PHOTOGRAPHY]
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A]/90 text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded border border-[#333333] flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      Zoom Fullscreen
                    </span>
                  </div>
                </div>
              )}

              {/* 360 View / Photo Toggle Badge */}
              <div className="absolute top-3 left-3 flex gap-2">
                <button
                  onClick={() => setView3D(v => !v)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
                    view3D
                      ? 'bg-[#D01F26] text-white border-[#D01F26]'
                      : 'bg-white/95 text-[#1A1A1A] border-[#D8D8D8] hover:border-[#D01F26]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{view3D ? 'View HD Photos' : '360° 3D Inspection'}</span>
                </button>
              </div>

              {/* Inspection Grade Badge */}
              <div className="absolute top-3 right-3 badge-grade">
                GRADE {vehicle.grade || '4.5'}
              </div>
            </div>

            {/* Thumbnail Strip (when not in 3D mode) */}
            {!view3D && images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`aspect-[4/3] rounded border cursor-pointer overflow-hidden transition-all ${
                      i === activeIdx ? 'border-[#D01F26] ring-1 ring-[#D01F26]' : 'border-[#D8D8D8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={toMediaUrl(url)} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Trust Guarantee Badges */}
            <div className="bg-white border border-[#D8D8D8] p-4 rounded grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-mono text-[#555555]">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>JEVIC Mileage Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Clean Export Title</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>JAAI Multi-Point Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Yokohama Terminal Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Insured RoRo Logistics</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Telegraphic TT Settlement</span>
              </div>
            </div>

          </div>

          {/* Right Column: Price & Conversion Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#D8D8D8] p-6 sm:p-7 rounded shadow-xs space-y-6">
            
            {/* Header & Badges */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#777777] mb-1">
                <span>STOCK #TA-{vehicle.id}</span>
                <span>·</span>
                <span className="text-[#D01F26] font-bold">PORT READY</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] leading-tight">
                {vehicleTitle}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#FAF8F5] border border-[#D8D8D8] px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-[#1A1A1A]">
                  {vehicle.year || '2020'}
                </span>
                <span className="bg-[#FAF8F5] border border-[#D8D8D8] px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-[#1A1A1A]">
                  {vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} km` : '18,000 km'}
                </span>
                <span className="bg-[#FAF8F5] border border-[#D8D8D8] px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-emerald-700">
                  Grade {vehicle.grade || '4.5'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#FAF8F5] border border-[#E8E8E8] p-5 rounded">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                FOB Price (Yokohama / Kobe Port)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#D01F26] font-mono mt-0.5">
                USD {priceFob > 0 ? priceFob.toLocaleString() : 'Inquire for Price'}
              </div>
              <p className="text-xs text-[#777777] mt-1 font-mono">
                Estimated CIF: ~USD {estimatedCif.toLocaleString()} (Includes sea freight to {selectedDestination.split(' ')[0]})
              </p>
            </div>

            {/* CTAs matching Mockup (Top Right in Image 1) */}
            <div className="space-y-2.5">
              <button
                onClick={() => { setInquirySent(false); setInquiryOpen(true) }}
                className="btn-tapro-red w-full py-3.5 text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Inquire / Request Invoice</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-charcoal w-full py-3 text-xs font-bold"
              >
                <svg className="w-4 h-4 fill-emerald-500" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.527.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.377-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.55.719.311 1.28.497 1.718.636.722.229 1.378.197 1.898.119.579-.087 1.783-.728 2.034-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.174L2 22l4.981-1.408A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                Chat on WhatsApp with Rep
              </a>

              <button
                onClick={() => setWatchlist(w => !w)}
                className={`btn-outline-silver w-full py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  watchlist ? 'border-[#D01F26] text-[#D01F26]' : ''
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${watchlist ? 'text-[#D01F26] fill-[#D01F26]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{watchlist ? 'Saved to Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>

            {/* Quick Overview Description */}
            {vehicle.description && (
              <div className="pt-3 border-t border-[#E8E8E8] text-xs text-[#555555] leading-relaxed">
                <span className="font-bold text-[#1A1A1A] block mb-1">Inspector Notes:</span>
                <p className="whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}

          </div>

        </div>

        {/* ── Lower Section: Specifications (Left) & Shipping Cost Calculator (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Specifications Table (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded border border-[#D8D8D8] shadow-xs">
            <h3 className="text-lg font-black text-[#1A1A1A] pb-3 mb-4 border-b border-[#E8E8E8]">
              Vehicle Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {specs.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#F0F0F0]">
                  <span className="font-mono text-[#777777]">{label}</span>
                  <span className="font-bold text-[#1A1A1A]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Cost Calculator (5 cols) as shown in mockup */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded border border-[#D8D8D8] shadow-xs space-y-4">
            <h3 className="text-lg font-black text-[#1A1A1A] pb-3 border-b border-[#E8E8E8]">
              Estimated Shipping Cost
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Destination Port
              </label>
              <select
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                className="form-input-grounded text-xs py-2.5 bg-white"
              >
                {Object.keys(SHIPPING_RATES).map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E8E8E8] p-4 rounded space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#777777]">Vehicle FOB Price:</span>
                <span className="font-bold text-[#1A1A1A]">USD {priceFob.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Estimated Sea Freight:</span>
                <span className="font-bold text-[#1A1A1A]">USD {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777777]">Marine Transit Insurance:</span>
                <span className="font-bold text-emerald-700">INCLUDED</span>
              </div>
              <div className="pt-2 border-t border-[#E8E8E8] flex justify-between text-sm">
                <span className="font-black text-[#1A1A1A]">Estimated Total CIF:</span>
                <span className="font-black text-[#D01F26]">USD {estimatedCif.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#777777] leading-relaxed">
              * Final freight rate may vary slightly based on vessel scheduling and volume dimensions. Formal CIF proforma invoice provided upon order confirmation.
            </p>
          </div>

        </div>

      </div>

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D8D8D8]">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3 mb-4">
              <h3 className="font-black text-lg text-[#1A1A1A]">Request Formal CIF Quotation</h3>
              <button onClick={() => setInquiryOpen(false)} className="text-slate-400 hover:text-slate-900 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {inquirySent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#1A1A1A]">Inquiry Ready in Email Client</h4>
                <p className="text-xs text-[#555555]">
                  Your message has been composed. If your email program didn't open automatically, contact our team directly at <strong>{DEALER_CONFIG.email}</strong>.
                </p>
                <button onClick={() => setInquiryOpen(false)} className="btn-tapro-red text-xs py-2 px-5 mt-2">
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#1A1A1A] font-bold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                    className="form-input-grounded text-xs py-2 bg-white"
                    placeholder="e.g. Michael Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#1A1A1A] font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                      className="form-input-grounded text-xs py-2 bg-white"
                      placeholder="e.g. client@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1A1A1A] font-bold mb-1">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                      className="form-input-grounded text-xs py-2 bg-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#1A1A1A] font-bold mb-1">Destination Country / Discharge Port *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.country}
                    onChange={e => setInquiryForm(f => ({ ...f, country: e.target.value }))}
                    className="form-input-grounded text-xs py-2 bg-white"
                    placeholder={`e.g. ${selectedDestination}`}
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A] font-bold mb-1">Specific Requirements / Message</label>
                  <textarea
                    rows={3}
                    value={inquiryForm.message}
                    onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                    className="form-input-grounded text-xs py-2 bg-white"
                    placeholder="Request inspection sheet translation, shipping schedule, wire payment details..."
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setInquiryOpen(false)} className="btn-outline-silver text-xs py-2 px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn-tapro-red text-xs py-2 px-5">
                    Send Inquiry to Sales Desk
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {images.length > 1 && (
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 font-mono text-sm bg-black/50 px-3 py-1 rounded-full">
              {activeIdx + 1} / {images.length}
            </span>
          )}
          {images.length > 1 && (
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-6xl leading-none z-10 p-4">‹</button>
          )}
          <img
            src={toMediaUrl(images[activeIdx])}
            alt={`${vehicleTitle} ${activeIdx + 1}`}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z) }}
            className={`max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl transition-transform duration-300 ${zoomed ? 'scale-[1.7] cursor-zoom-out' : 'cursor-zoom-in'}`}
          />
          {images.length > 1 && (
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-6xl leading-none z-10 p-4">›</button>
          )}
        </div>
      )}
    </div>
  )
}
