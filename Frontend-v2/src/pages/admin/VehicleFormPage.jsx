import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createVehicle, getVehicle, updateVehicle } from '../../api/vehicles'
import { uploadImage } from '../../api/cloudinary'
import { toMediaUrl } from '../../utils/mediaUrl'

const CURRENT_YEAR = new Date().getFullYear()

const INITIAL = {
  title:         '',
  description:   '',
  startingPrice: '',
  make:          '',
  model:         '',
  year:          CURRENT_YEAR,
  status:        'draft',
  chassisNumber: '',
  mileage:       '',
  grade:         '',
}

export default function VehicleFormPage() {
  const { id } = useParams()          // present on edit route
  const isEdit = Boolean(id)
  const [form, setForm]             = useState(INITIAL)
  const [existingImages, setExisting] = useState([])   // URLs already in DB
  const [newFiles, setNewFiles]       = useState([])   // File objects not yet uploaded
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const navigate = useNavigate()

  // pre-populate form when editing
  useEffect(() => {
    if (!isEdit) return
    getVehicle(id)
      .then(res => {
        const v = res.data
        setForm({
          title:         v.title         ?? '',
          description:   v.description   ?? '',
          startingPrice: v.starting_price ?? '',
          make:          v.make          ?? '',
          model:         v.model         ?? '',
          year:          v.year          ?? CURRENT_YEAR,
          status:        v.status        ?? 'draft',
          chassisNumber: v.chassis_number ?? '',
          mileage:       v.mileage != null ? String(v.mileage) : '',
          grade:         v.grade         ?? '',
        })
        setExisting(v.images ?? [])
      })
      .catch(() => setError('Failed to load vehicle'))
      .finally(() => setLoadingData(false))
  }, [id, isEdit])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Upload any new files to Cloudinary first
      const uploadedUrls = await Promise.all(newFiles.map(f => uploadImage(f)))
      const images = [...existingImages, ...uploadedUrls]

      const payload = {
        title:         form.title,
        description:   form.description,
        startingPrice: Number(form.startingPrice),
        make:          form.make,
        model:         form.model,
        year:          Number(form.year),
        status:        form.status,
        chassisNumber: form.chassisNumber || null,
        mileage:       form.mileage !== '' ? Number(form.mileage) : null,
        grade:         form.grade   || null,
        images,
      }
      if (isEdit) {
        await updateVehicle(id, payload)
        navigate('/admin', { state: { updated: 'vehicle' } })
      } else {
        const res = await createVehicle(payload)
        navigate('/admin', { state: { created: 'vehicle', id: res.data.id } })
      }
    } catch (err) {
      const details = err.response?.data?.details
      setError(details ? details.join(', ') : (err.response?.data?.message ?? err.message ?? 'Failed to save vehicle'))
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="bg-[#F8F6F2] min-h-[calc(100vh-140px)] flex items-center justify-center text-[#777777] font-mono text-sm">Loading vehicle data…</div>

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b border-[#D8D8D8] pb-4">
          <p className="text-[11px] font-mono tracking-widest text-[#D01F26] uppercase font-bold">Inventory Management</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">{isEdit ? 'Edit Vehicle Profile' : 'Add Vehicle to Inventory'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#D01F26] rounded p-3.5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 space-y-5 shadow-xs">

          {/* Title */}
          <Field label="Vehicle Listing Title *">
            <input name="title" required value={form.title} onChange={onChange}
              placeholder="e.g. 2021 Toyota Land Cruiser ZX V8"
              className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
          </Field>

          {/* Make / Model / Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Make *">
              <input name="make" required value={form.make} onChange={onChange}
                placeholder="Toyota" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
            </Field>
            <Field label="Model *">
              <input name="model" required value={form.model} onChange={onChange}
                placeholder="Land Cruiser" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
            </Field>
            <Field label="Year *">
              <input name="year" type="number" required min={1900} max={2100}
                value={form.year} onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]" />
            </Field>
          </div>

          {/* Starting price */}
          <Field label="Starting Price (USD FOB) *">
            <input name="startingPrice" type="number" required min={1} step="0.01"
              value={form.startingPrice} onChange={onChange}
              placeholder="e.g. 25000" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
          </Field>

          {/* Description */}
          <Field label="Vehicle Condition & Export Notes *">
            <textarea name="description" rows={3} value={form.description}
              onChange={onChange} placeholder="Provide mechanical notes, options, auction history, tyre wear…"
              className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26] resize-none" />
          </Field>

          {/* Status */}
          <Field label="Inventory Status *">
            <select name="status" value={form.status} onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]">
              <option value="draft">Draft (Warehouse prep)</option>
              <option value="listed">Listed (Public inventory)</option>
              <option value="sold">Sold (Exported/Dispatched)</option>
            </select>
          </Field>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Chassis Number / VIN">
              <input name="chassisNumber" value={form.chassisNumber} onChange={onChange}
                placeholder="e.g. URJ202-0019482" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
            </Field>
            <Field label="Mileage (km)">
              <input name="mileage" type="number" min={0} value={form.mileage}
                onChange={onChange} placeholder="42000" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
            </Field>
          </div>

          <Field label="Auction Sheet Grade (USS/TAA)">
            <input name="grade" value={form.grade} onChange={onChange}
              placeholder="e.g. 4.5 / A" className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
          </Field>

          {/* Images */}
          <Field label="Vehicle Gallery & Inspection Photos">
            {/* Existing image previews */}
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {existingImages.map((url, i) => (
                  <div key={url} className="relative w-20 h-20 rounded overflow-hidden border border-[#D8D8D8] group">
                    <img src={toMediaUrl(url)} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExisting(prev => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/70 text-white text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New file previews */}
            {newFiles.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {newFiles.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-[#D8D8D8] group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewFiles(prev => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/70 text-white text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file" accept="image/*" multiple
              onChange={e => setNewFiles(prev => [...prev, ...Array.from(e.target.files)])}
              className="block w-full text-xs text-[#555555] file:mr-3 file:py-2 file:px-4 file:rounded file:border file:border-[#D8D8D8] file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#FAF8F5] file:text-[#1A1A1A] hover:file:bg-[#1A1A1A] hover:file:text-white cursor-pointer transition-colors"
            />
            <p className="text-[11px] text-[#777777] mt-1.5">Multiple high-resolution photo uploads supported. Hover on thumbnail to remove.</p>
          </Field>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#EAEAEA]">
            <button type="submit" disabled={loading}
              className="btn-tapro-red text-xs px-6 py-2.5 disabled:opacity-50">
              {loading ? 'Processing…' : isEdit ? 'Update Vehicle' : 'Save & Publish'}
            </button>
            <button type="button" onClick={() => navigate('/admin')}
              className="bg-white border border-[#D8D8D8] hover:border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
