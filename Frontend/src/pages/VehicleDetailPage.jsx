import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVehicle } from '../api/vehicles'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'
import { isAuctionEnabled, DEALER_CONFIG } from '../config/appConfig'
import { useAuth } from '../context/AuthContext'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [vehicle, setVehicle]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [activeIdx, setActiveIdx]   = useState(0)
  const [lightbox, setLightbox]     = useState(false)
  const [zoomed, setZoomed]         = useState(false)

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
    if (e.key === 'Escape')     closeLightbox()
    if (e.key === 'ArrowLeft')  setActiveIdx(i => (i - 1 + images.length) % images.length)
    if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % images.length)
  }, [lightbox, images.length])

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  if (loading) return <Spinner />
  if (error || !vehicle) return (
    <div className="p-12 text-center">
      <p className="text-red-600 font-medium">{error || 'Not found'}</p>
    </div>
  )

  const vehicleTitle = vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`
  const price = Number(vehicle.starting_price ?? 0)

  const specs = [
    { label: 'Make',    value: vehicle.make },
    { label: 'Model',   value: vehicle.model },
    { label: 'Year',    value: vehicle.year },
    { label: 'Mileage', value: vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} km` : null },
    { label: 'Grade',   value: vehicle.grade },
    { label: 'Chassis', value: vehicle.chassis_number },
    { label: 'Engine',  value: vehicle.engine_capacity ? `${vehicle.engine_capacity} cc` : null },
    { label: 'Fuel',    value: vehicle.fuel_type },
    { label: 'Transmission', value: vehicle.transmission },
  ].filter(s => s.value != null && s.value !== '')

  const whatsappMessage = `Hello ${DEALER_CONFIG.name}, I am interested in Stock #${vehicle.id}: ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.chassis_number ? 'Chassis ' + vehicle.chassis_number : ''}). Is this still available for export shipment?`
  const whatsappUrl = `https://wa.me/${DEALER_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

  function handleInquirySubmit(e) {
    e.preventDefault()
    // Open default email client with structured pre-filled proposal
    const subject = encodeURIComponent(`Vehicle Inquiry: Stock #${vehicle.id} - ${vehicleTitle}`)
    const body = encodeURIComponent(
      `Hello ${DEALER_CONFIG.name} Sales Team,\n\n` +
      `I would like to inquire about the following vehicle:\n` +
      `- Vehicle: ${vehicleTitle}\n` +
      `- Stock ID: ${vehicle.id}\n` +
      `- Chassis Number: ${vehicle.chassis_number || 'N/A'}\n` +
      `- Price Listed: USD ${price.toLocaleString()}\n\n` +
      `My Details:\n` +
      `- Name: ${inquiryForm.name}\n` +
      `- Email: ${inquiryForm.email}\n` +
      `- Phone/WhatsApp: ${inquiryForm.phone}\n` +
      `- Destination Port / Country: ${inquiryForm.country}\n\n` +
      `Inquiry / Request:\n` +
      `${inquiryForm.message || 'Please send CIF shipping quotation, inspection sheet, and payment wire instructions.'}\n`
    )
    window.location.href = `mailto:${DEALER_CONFIG.email}?subject=${subject}&body=${body}`
    setInquirySent(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-gray-900 transition-colors">
          {isAuctionEnabled ? 'Vehicles' : 'Showroom Inventory'}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{vehicleTitle}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Images */}
        <div className="w-full lg:w-7/12 space-y-4">
          {images.length > 0 ? (
            <div>
              {/* Hero image — click to open lightbox */}
              <div
                className="relative group cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-gray-950 shadow-md"
                onClick={() => openLightbox(activeIdx)}
              >
                <img
                  src={toMediaUrl(images[activeIdx])}
                  alt={vehicleTitle}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/75 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    🔍 Click to zoom full screen
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 cursor-pointer transition-all hover:opacity-90 
                        ${i === activeIdx ? 'border-amber-500 shadow-sm' : 'border-gray-200 opacity-70'}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <img
                        src={toMediaUrl(url)}
                        alt={`${vehicleTitle} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
              No images available
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>100% Verified Odometer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Export Certificate Included</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Multi-Point Inspected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Yokohama / Kobe Port Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Insured Sea Freight Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Proforma Wire Transfer (TT)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="w-full lg:w-5/12 space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Stock ID #{vehicle.id}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {vehicleTitle}
                </h1>
              </div>
              <div className="mt-1">
                <StatusBadge status={vehicle.status} />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}
              {vehicle.chassis_number && ` · Chassis: ${vehicle.chassis_number}`}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-lg border border-slate-700">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                {isAuctionEnabled ? 'Starting Auction Price' : 'FOB Export Price'}
              </p>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">
                Port Ready
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              USD {price > 0 ? price.toLocaleString() : 'Inquire for Quote'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Estimated CIF shipping quotes calculated based on your destination discharge port.
            </p>
          </div>

          {/* Dealership Action Buttons (Direct Conversion) */}
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.783-.879-2.06-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.352.225-.653.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.527.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.377-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.55.719.311 1.28.497 1.718.636.722.229 1.378.197 1.898.119.579-.087 1.783-.728 2.034-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.174L2 22l4.981-1.408A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              Inquire Instantly on WhatsApp
            </a>

            <button
              onClick={() => { setInquirySent(false); setInquiryOpen(true) }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all text-sm border border-slate-700"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              Request Formal CIF Quote / Inspection Sheet
            </button>
          </div>

          {/* Specs grid */}
          {specs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-base font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-900 font-semibold truncate" title={value}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h2 className="text-base font-bold text-slate-900 mb-2">Condition &amp; Equipment Notes</h2>
              <p className="text-slate-600 text-xs whitespace-pre-wrap leading-relaxed">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Concierge Contact Box */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Need Custom Vehicle Sourcing?</p>
              <p className="text-slate-600">Our Yokohama desk can source any Japanese vehicle directly.</p>
            </div>
            <a
              href={`mailto:${DEALER_CONFIG.email}?subject=Custom%20Vehicle%20Sourcing%20Request`}
              className="text-amber-800 font-bold hover:underline shrink-0"
            >
              Contact Desk →
            </a>
          </div>

          <div className="pt-2">
            <Link to="/vehicles" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 w-max">
              ← Return to Showroom Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-900">Request Formal Quote</h3>
              <button
                onClick={() => setInquiryOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {inquirySent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-slate-900">Inquiry Prepared</h4>
                <p className="text-xs text-slate-600">
                  Your email client should have opened with the pre-filled quotation request. If not, feel free to email our sales desk directly at <strong>{DEALER_CONFIG.email}</strong>.
                </p>
                <button
                  onClick={() => setInquiryOpen(false)}
                  className="btn-primary mt-2 text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                      className="input w-full"
                      placeholder="e.g. client@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                      className="input w-full"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Destination Country &amp; Port</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.country}
                    onChange={e => setInquiryForm(f => ({ ...f, country: e.target.value }))}
                    className="input w-full"
                    placeholder="e.g. Mombasa, Kenya / Dublin, Ireland"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Message / Requirements</label>
                  <textarea
                    rows={3}
                    value={inquiryForm.message}
                    onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                    className="input w-full"
                    placeholder="Request inspection sheet, shipping ETA, payment invoice..."
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
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
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl leading-none z-10 transition-colors" aria-label="Close">✕</button>
          
          {images.length > 1 && (
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 font-medium text-sm tracking-widest z-10 bg-black/50 px-3 py-1 rounded-full">
              {activeIdx + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-6xl leading-none z-10 p-4 transition-colors" aria-label="Previous">‹</button>
          )}

          <img
            src={toMediaUrl(images[activeIdx])}
            alt={`${vehicleTitle} ${activeIdx + 1}`}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z) }}
            className={`max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl transition-transform duration-500 select-none
              ${zoomed ? 'scale-[1.7] cursor-zoom-out' : 'cursor-zoom-in'}`}
          />

          {images.length > 1 && (
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-6xl leading-none z-10 p-4 transition-colors" aria-label="Next">›</button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2" onClick={e => e.stopPropagation()}>
              {images.map((url, i) => (
                <img
                  key={i}
                  src={toMediaUrl(url)}
                  alt={`thumb ${i + 1}`}
                  className={`w-16 h-16 object-cover rounded shrink-0 cursor-pointer border-2 transition-all duration-200
                    ${i === activeIdx ? 'border-amber-500 opacity-100 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
                  onClick={() => { setActiveIdx(i); setZoomed(false) }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
