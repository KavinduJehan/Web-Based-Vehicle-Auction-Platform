import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAuction, getAuction, updateAuction } from '../../api/auctions'
import { listVehicles } from '../../api/vehicles'

const INITIAL = {
  vehicleId:    '',
  title:        '',
  description:  '',
  status:       'draft',
  startsAt:     '',
  endsAt:       '',
  minIncrement: '0',
  reservePrice: '',
}

export default function AuctionFormPage() {
  const { id } = useParams()       // present on edit route
  const isEdit = Boolean(id)
  const [form, setForm]         = useState(INITIAL)
  const [vehicles, setVehicles] = useState([])
  const [loadingV, setLoadingV] = useState(true)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    listVehicles({ limit: 100 })
      .then(res => setVehicles(res.data.data ?? res.data))
      .catch(() => setVehicles([]))
      .finally(() => setLoadingV(false))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getAuction(id)
      .then(res => {
        const a = res.data
        // format ISO to datetime-local (trim seconds)
        const fmt = (s) => s ? s.slice(0, 16) : ''
        setForm({
          vehicleId:    String(a.vehicle_id ?? ''),
          title:        a.title        ?? '',
          description:  a.description  ?? '',
          status:       a.status       ?? 'draft',
          startsAt:     fmt(a.starts_at),
          endsAt:       fmt(a.ends_at),
          minIncrement: String(a.min_increment ?? '0'),
          reservePrice: a.reserve_price != null ? String(a.reserve_price) : '',
        })
      })
      .catch(() => setError('Failed to load auction'))
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
      const payload = {
        minIncrement: Number(form.minIncrement),
        reservePrice: form.reservePrice !== '' ? Number(form.reservePrice) : null,
      }
      if (form.title)       payload.title       = form.title
      if (form.description) payload.description = form.description
      if (form.status)      payload.status      = form.status
      if (form.startsAt)    payload.startsAt    = new Date(form.startsAt).toISOString()
      if (form.endsAt)      payload.endsAt      = new Date(form.endsAt).toISOString()

      if (isEdit) {
        await updateAuction(id, payload)
        navigate(`/auctions/${id}`)
      } else {
        payload.vehicleId = Number(form.vehicleId)
        const res = await createAuction(payload)
        navigate(`/auctions/${res.data.id}`)
      }
    } catch (err) {
      const details = err.response?.data?.details
      setError(details ? details.join(', ') : (err.response?.data?.message ?? 'Failed to create auction'))
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <div className="p-12 text-center text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Auction' : 'Create Auction'}</h1>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">

        {/* Vehicle (create only) */}
        {!isEdit && (
          <Field label="Vehicle *">
            {loadingV ? (
              <p className="text-sm text-gray-400">Loading vehicles…</p>
            ) : vehicles.length === 0 ? (
              <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg p-2">
                No vehicles found.{' '}
                <span className="font-medium underline cursor-pointer" onClick={() => navigate('/admin/vehicles/new')}>
                  Add one first.
                </span>
              </p>
            ) : (
              <select name="vehicleId" required value={form.vehicleId} onChange={onChange} className="input">
                <option value="">— select vehicle —</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.title || `${v.make} ${v.model} ${v.year}`} (ID {v.id})
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

        {/* Title */}
        <Field label="Auction Title (optional)">
          <input name="title" value={form.title} onChange={onChange}
            placeholder="Defaults to vehicle title if blank"
            className="input" />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea name="description" rows={2} value={form.description}
            onChange={onChange} placeholder="Any special notes…"
            className="input resize-none" />
        </Field>

        {/* Status */}
        <Field label="Initial Status">
          <select name="status" value={form.status} onChange={onChange} className="input">
            <option value="draft">Draft (not visible to buyers)</option>
            <option value="active">Active (open immediately)</option>
          </select>
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts At">
            <input name="startsAt" type="datetime-local" value={form.startsAt}
              onChange={onChange} className="input" />
          </Field>
          <Field label="Ends At">
            <input name="endsAt" type="datetime-local" value={form.endsAt}
              onChange={onChange} className="input" />
          </Field>
        </div>

        {/* Min increment */}
        <Field label="Minimum Bid Increment (LKR)">
          <input name="minIncrement" type="number" min={0} step="1"
            value={form.minIncrement} onChange={onChange} className="input" />
        </Field>

        {/* Reserve price (hidden from buyers) */}
        <Field label="Reserve Price — LKR (hidden from buyers)">
          <input name="reservePrice" type="number" min={0} step="1"
            value={form.reservePrice} onChange={onChange} placeholder="Leave blank for no reserve"
            className="input" />
          <p className="text-xs text-gray-400 mt-1">
            Bidding will show as &#34;reserve not met&#34; (red) until the highest bid exceeds this value. Buyers cannot see the amount.
          </p>
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading || loadingV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Auction'}
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
