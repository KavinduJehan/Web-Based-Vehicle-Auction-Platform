import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listVehicles } from '../api/vehicles'
import StatusBadge from '../components/StatusBadge'

const LIMIT = 12

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc',  label: 'Oldest first' },
  { value: 'starting_price:asc',  label: 'Price: Low → High' },
  { value: 'starting_price:desc', label: 'Price: High → Low' },
  { value: 'year:desc', label: 'Year: Newest' },
  { value: 'year:asc',  label: 'Year: Oldest' },
]

export default function VehicleListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // read filter state from URL so back/forward works
  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   ?? '',
    make:     searchParams.get('make')     ?? '',
    model:    searchParams.get('model')    ?? '',
    yearMin:  searchParams.get('yearMin')  ?? '',
    yearMax:  searchParams.get('yearMax')  ?? '',
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    status:   searchParams.get('status')   ?? '',
    sort:     searchParams.get('sort')     ?? 'created_at:desc',
  })
  const [page, setPage]       = useState(Number(searchParams.get('page') ?? 1))
  const [data, setData]       = useState({ data: [], total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetch = useCallback(async (f, p) => {
    setLoading(true)
    setError('')
    try {
      const [sortBy, order] = f.sort.split(':')
      const params = { page: p, limit: LIMIT, sortBy, order }
      if (f.search)   params.search   = f.search
      if (f.make)     params.make     = f.make
      if (f.model)    params.model    = f.model
      if (f.yearMin)  params.yearMin  = f.yearMin
      if (f.yearMax)  params.yearMax  = f.yearMax
      if (f.priceMin) params.priceMin = f.priceMin
      if (f.priceMax) params.priceMax = f.priceMax
      if (f.status)   params.status   = f.status
      const res = await listVehicles(params)
      setData(res.data)
    } catch {
      setError('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [])

  // sync URL params and fetch whenever filters/page change
  useEffect(() => {
    const p = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v })
    if (page > 1) p.page = page
    setSearchParams(p, { replace: true })
    fetch(filters, page)
  }, [filters, page]) // eslint-disable-line react-hooks/exhaustive-deps

  function onChange(e) {
    const { name, value } = e.target
    setFilters(f => ({ ...f, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters({ search:'', make:'', model:'', yearMin:'', yearMax:'', priceMin:'', priceMax:'', status:'', sort:'created_at:desc' })
    setPage(1)
  }

  const hasActiveFilters = filters.search || filters.make || filters.model ||
    filters.yearMin || filters.yearMax || filters.priceMin || filters.priceMax || filters.status

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
        <span className="text-sm text-gray-400">{data.total} vehicle{data.total !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Filters bar ── */}
      <div className="bg-white border rounded-xl p-4 mb-6 space-y-3">

        {/* Search + sort row */}
        <div className="flex gap-3 flex-wrap">
          <input
            name="search" value={filters.search} onChange={onChange}
            placeholder="Search title, make, model, chassis…"
            className="input flex-1 min-w-48"
          />
          <select name="sort" value={filters.sort} onChange={onChange} className="input w-52">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filter row */}
        <div className="flex gap-3 flex-wrap items-center">
          <input
            name="make" value={filters.make} onChange={onChange}
            placeholder="Make (e.g. Toyota)"
            className="input w-40"
          />
          <input
            name="model" value={filters.model} onChange={onChange}
            placeholder="Model"
            className="input w-36"
          />
          <input
            name="yearMin" type="number" value={filters.yearMin} onChange={onChange}
            placeholder="Year from" min={1900} max={2100}
            className="input w-28"
          />
          <input
            name="yearMax" type="number" value={filters.yearMax} onChange={onChange}
            placeholder="Year to" min={1900} max={2100}
            className="input w-28"
          />
          <input
            name="priceMin" type="number" value={filters.priceMin} onChange={onChange}
            placeholder="Min price"
            className="input w-32"
          />
          <input
            name="priceMax" type="number" value={filters.priceMax} onChange={onChange}
            placeholder="Max price"
            className="input w-32"
          />
          <select name="status" value={filters.status} onChange={onChange} className="input w-32">
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {error && <div className="text-center text-red-600 py-12">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No vehicles found.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-blue-600 hover:underline text-sm">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map(v => (
            <Link
              key={v.id}
              to={`/vehicles/${v.id}`}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Thumbnail */}
              {v.images?.[0] ? (
                <img
                  src={v.images[0]}
                  alt={v.title}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">
                  🚗
                </div>
              )}

              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {v.title || `${v.make} ${v.model} ${v.year}`}
                  </h2>
                  <StatusBadge status={v.status} />
                </div>

                <p className="text-xs text-gray-400">
                  {[v.make, v.model, v.year].filter(Boolean).join(' · ')}
                </p>

                {v.mileage != null && (
                  <p className="text-xs text-gray-400">{Number(v.mileage).toLocaleString()} km</p>
                )}

                <p className="text-blue-600 font-bold mt-auto">
                  LKR {Number(v.starting_price).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => p - 1)} disabled={page <= 1}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === data.totalPages || Math.abs(n - page) <= 1)
            .reduce((acc, n, i, arr) => {
              if (i > 0 && n - arr[i - 1] > 1) acc.push('…')
              acc.push(n)
              return acc
            }, [])
            .map((n, i) =>
              n === '…' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    n === page
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              )
            )
          }

          <button
            onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
