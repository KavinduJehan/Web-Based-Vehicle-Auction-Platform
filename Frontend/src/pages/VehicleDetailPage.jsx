import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVehicle } from '../api/vehicles'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const [vehicle, setVehicle]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [activeIdx, setActiveIdx]   = useState(0)
  const [lightbox, setLightbox]     = useState(false)
  const [zoomed, setZoomed]         = useState(false)

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

  const specs = [
    { label: 'Make',    value: vehicle.make },
    { label: 'Model',   value: vehicle.model },
    { label: 'Year',    value: vehicle.year },
    { label: 'Mileage', value: vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} km` : null },
    { label: 'Grade',   value: vehicle.grade },
    { label: 'Chassis', value: vehicle.chassis_number },
  ].filter(s => s.value != null && s.value !== '')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Images */}
        <div className="w-full lg:w-7/12 space-y-4">
          {images.length > 0 ? (
            <div>
              {/* Hero image — click to open lightbox */}
              <div
                className="relative group cursor-zoom-in overflow-hidden rounded border border-gray-200 bg-gray-50 shadow-sm"
                onClick={() => openLightbox(activeIdx)}
              >
                <img
                  src={toMediaUrl(images[activeIdx])}
                  alt={vehicle.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    Click to zoom
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className={`relative aspect-[4/3] overflow-hidden rounded border cursor-pointer transition-all hover:opacity-90 
                        ${i === activeIdx ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-300'}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      <img
                        src={toMediaUrl(url)}
                        alt={`${vehicle.title} ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400">
              No images available
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="w-full lg:w-5/12 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
              </h1>
              <div className="mt-2">
                <StatusBadge status={vehicle.status} />
              </div>
            </div>
          </div>

          {/* Starting price */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Starting price</p>
            <p className="text-4xl font-bold text-red-600">
              USD {Number(vehicle.starting_price).toLocaleString()}
            </p>
          </div>

          {/* Specs grid */}
          {specs.length > 0 && (
            <div>
              <div className="border-b border-red-200 mb-4 pb-2">
                <h2 className="text-2xl font-light text-gray-800">Vehicle Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex gap-2">
                    <span className="font-bold text-gray-900 w-1/3 shrink-0">{label}</span>
                    <span className="text-gray-700 w-2/3 truncate" title={value}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Details */}
          {vehicle.description && (
            <div>
              <div className="border-b border-red-200 mb-4 pb-2">
                <h2 className="text-2xl font-light text-gray-800">Other Details</h2>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {vehicle.description}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Link to="/vehicles" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-max">
              ← Back to vehicles
            </Link>
          </div>
        </div>
      </div>

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
            alt={`${vehicle.title} ${activeIdx + 1}`}
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
                    ${i === activeIdx ? 'border-red-500 opacity-100 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
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
