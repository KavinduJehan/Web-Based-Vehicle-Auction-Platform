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

  if (loadingData) return <div className="bg-[#F8F6F2] min-h-[calc(100vh-140px)] flex items-center justify-center text-[#777777] font-mono text-sm">Loading auction configuration…</div>

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b border-[#D8D8D8] pb-4">
          <p className="text-[11px] font-mono tracking-widest text-[#D01F26] uppercase font-bold">Auction Management</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">{isEdit ? 'Edit Auction Parameters' : 'Create Live Auction'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#D01F26] rounded p-3.5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 space-y-5 shadow-xs">

          {/* Vehicle (create only) */}
          {!isEdit && (
            <Field label="Target Vehicle *">
              {loadingV ? (
                <p className="text-xs text-[#777777]">Loading inventory database…</p>
              ) : vehicles.length === 0 ? (
                <div className="p-3 bg-[#FAF8F5] border border-[#EBEBEB] rounded text-xs text-[#555555]">
                  No vehicles available for listing.{' '}
                  <span className="font-bold text-[#D01F26] hover:underline cursor-pointer" onClick={() => navigate('/admin/vehicles/new')}>
                    Add a new vehicle first.
                  </span>
                </div>
              ) : (
                <select name="vehicleId" required value={form.vehicleId} onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]">
                  <option value="">— Select Vehicle From Inventory —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.title || `${v.make} ${v.model} ${v.year}`} (ID #{v.id})
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}

          {/* Title */}
          <Field label="Auction Title (Optional)">
            <input name="title" value={form.title} onChange={onChange}
              placeholder="Defaults to vehicle title if left blank"
              className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
          </Field>

          {/* Description */}
          <Field label="Special Terms & Export Description">
            <textarea name="description" rows={3} value={form.description}
              onChange={onChange} placeholder="Provide auction notes, shipping terms, or inspection caveats…"
              className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26] resize-none" />
          </Field>

          {/* Status */}
          <Field label="Initial Listing Status">
            <select name="status" value={form.status} onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]">
              <option value="draft">Draft (Private, not visible in public auctions)</option>
              <option value="active">Active (Visible and accepting bids immediately)</option>
            </select>
          </Field>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Starts At">
              <input name="startsAt" type="datetime-local" value={form.startsAt}
                onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]" />
            </Field>
            <Field label="Ends At">
              <input name="endsAt" type="datetime-local" value={form.endsAt}
                onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]" />
            </Field>
          </div>

          {/* Min increment */}
          <Field label="Minimum Bid Increment (USD)">
            <input name="minIncrement" type="number" min={0} step="1"
              value={form.minIncrement} onChange={onChange} className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D01F26]" />
          </Field>

          {/* Reserve price (hidden from buyers) */}
          <Field label="Reserve Price (USD — Confidential)">
            <input name="reservePrice" type="number" min={0} step="1"
              value={form.reservePrice} onChange={onChange} placeholder="Leave blank for no reserve requirement"
              className="w-full bg-[#FAF8F5] border border-[#D8D8D8] rounded px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#D01F26]" />
            <p className="text-[11px] text-[#777777] mt-1">
              Bidding will reflect "Reserve Not Met" until this threshold is reached. Absolute value is strictly concealed from buyers.
            </p>
          </Field>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#EAEAEA]">
            <button type="submit" disabled={loading || loadingV}
              className="btn-tapro-red text-xs px-6 py-2.5 disabled:opacity-50">
              {loading ? 'Processing…' : isEdit ? 'Update Auction' : 'Launch Auction'}
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
