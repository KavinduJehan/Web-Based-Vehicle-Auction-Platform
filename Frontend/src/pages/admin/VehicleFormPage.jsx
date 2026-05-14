import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createVehicle, getVehicle, updateVehicle } from '../../api/vehicles'
import { uploadImage } from '../../api/cloudinary'

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

  if (loadingData) return <div className="p-12 text-center text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">

        {/* Title */}
        <Field label="Title *">
          <input name="title" required value={form.title} onChange={onChange}
            placeholder="e.g. Toyota Land Cruiser 200"
            className="input" />
        </Field>

        {/* Make / Model / Year */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Make *">
            <input name="make" required value={form.make} onChange={onChange}
              placeholder="Toyota" className="input" />
          </Field>
          <Field label="Model *">
            <input name="model" required value={form.model} onChange={onChange}
              placeholder="Land Cruiser" className="input" />
          </Field>
          <Field label="Year *">
            <input name="year" type="number" required min={1900} max={2100}
              value={form.year} onChange={onChange} className="input" />
          </Field>
        </div>

        {/* Starting price */}
        <Field label="Starting Price (USD) *">
          <input name="startingPrice" type="number" required min={1} step="0.01"
            value={form.startingPrice} onChange={onChange}
            placeholder="5000000" className="input" />
        </Field>

        {/* Description */}
        <Field label="Description *">
          <textarea name="description" rows={3} value={form.description}
            onChange={onChange} placeholder="Condition, history, extras…"
            className="input resize-none" />
        </Field>

        {/* Status */}
        <Field label="Status *">
          <select name="status" value={form.status} onChange={onChange} className="input">
            <option value="draft">Draft</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>
        </Field>

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chassis Number">
            <input name="chassisNumber" value={form.chassisNumber} onChange={onChange}
              placeholder="JZX100-0012345" className="input" />
          </Field>
          <Field label="Mileage (km)">
            <input name="mileage" type="number" min={0} value={form.mileage}
              onChange={onChange} placeholder="85000" className="input" />
          </Field>
        </div>

        <Field label="Grade">
          <input name="grade" value={form.grade} onChange={onChange}
            placeholder="4.5" className="input" />
        </Field>

        {/* Images */}
        <Field label="Images">
          {/* Existing image previews */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingImages.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img src={url} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setExisting(prev => prev.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New file previews */}
          {newFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {newFiles.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNewFiles(prev => prev.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">Upload multiple images. Hover a thumbnail to remove it.</p>
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Vehicle'}
          </button>
          <button type="button" onClick={() => navigate('/admin')}
            className="px-6 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
