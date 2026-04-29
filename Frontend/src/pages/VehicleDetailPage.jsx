import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVehicle } from '../api/vehicles'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'

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
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="space-y-2">
          {/* Hero image — click to open lightbox */}
          <div
            className="relative group cursor-zoom-in overflow-hidden rounded-xl border"
            onClick={() => openLightbox(activeIdx)}
          >
            <img
              src={images[activeIdx]}
              alt={vehicle.title}
              className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                Click to zoom
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${vehicle.title} ${i + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg border-2 shrink-0 cursor-pointer transition-all hover:opacity-90
                    ${i === activeIdx ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300 z-10"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {activeIdx + 1} / {images.length}
            </span>
          )}

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300 z-10 px-2"
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* Image — click toggles zoom */}
          <img
            src={images[activeIdx]}
            alt={`${vehicle.title} ${activeIdx + 1}`}
            onClick={(e) => { e.stopPropagation(); setZoomed(z => !z) }}
            className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-300 select-none
              ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300 z-10 px-2"
              aria-label="Next"
            >
              ›
            </button>
          )}

          {/* Thumbnail strip in lightbox */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg px-2"
              onClick={e => e.stopPropagation()}
            >
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`thumb ${i + 1}`}
                  className={`w-14 h-14 object-cover rounded-md shrink-0 cursor-pointer border-2 transition-all
                    ${i === activeIdx ? 'border-blue-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'}`}
                  onClick={() => { setActiveIdx(i); setZoomed(false) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
          </h1>
          {vehicle.description && (
            <p className="text-gray-500 mt-1">{vehicle.description}</p>
          )}
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      {/* Starting price */}
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500 mb-1">Starting price</p>
        <p className="text-3xl font-bold text-blue-600">
          LKR {Number(vehicle.starting_price).toLocaleString()}
        </p>
      </div>

      {/* Specs grid */}
      {specs.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Specifications</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specs.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <Link to="/vehicles" className="text-sm text-blue-600 hover:underline">
        ← Back to vehicles
      </Link>
    </div>
  )
}
