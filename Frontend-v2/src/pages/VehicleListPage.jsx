import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listVehicles } from '../api/vehicles'
import { toMediaUrl } from '../utils/mediaUrl'

const LIMIT = 12

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Latest Arrivals' },
  { value: 'starting_price:asc', label: 'Price: Low → High' },
  { value: 'starting_price:desc', label: 'Price: High → Low' },
  { value: 'year:desc', label: 'Year: Newest' },
  { value: 'year:asc', label: 'Year: Oldest' },
]

const BODY_STYLES = ['SUV & 4WD', 'Sedan', 'Coupe / Sports', 'Hatchback', 'Van & Wagon', 'Truck / Commercial']

export default function VehicleListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    search: searchParams.get('search') ?? '',
    make: searchParams.get('make') ?? '',
    model: searchParams.get('model') ?? '',
    yearMin: searchParams.get('yearMin') ?? '',
    yearMax: searchParams.get('yearMax') ?? '',
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    status: searchParams.get('status') ?? '',
    sort: searchParams.get('sort') ?? 'created_at:desc',
  })
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1))
  const [data, setData] = useState({ data: [], total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async (f, p) => {
    setLoading(true)
    setError('')
    try {
      const [sortBy, order] = f.sort.split(':')
      const params = { page: p, limit: LIMIT, sortBy, order }
      if (f.search) params.search = f.search
      if (f.make) params.make = f.make
      if (f.model) params.model = f.model
      if (f.yearMin) params.yearMin = f.yearMin
      if (f.yearMax) params.yearMax = f.yearMax
      if (f.priceMin) params.priceMin = f.priceMin
      if (f.priceMax) params.priceMax = f.priceMax
      if (f.status) params.status = f.status
      const res = await listVehicles(params)
      setData(res.data)
    } catch {
      setError('Failed to load vehicles from export database')
    } finally {
      setLoading(false)
    }
  }, [])

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
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D8D8D8] pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
              VERIFIED MOTOR EXPORT CATALOG
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Vehicle Listings
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Explore a wide range of Japanese used vehicles ready for direct port dispatch.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-white border border-[#D8D8D8] text-[#1A1A1A] px-3 py-1.5 rounded self-start sm:self-auto">
            {data.total} Vehicles Available
          </span>
        </div>

        {/* 2-Column Enterprise Layout: Left Sidebar (3 cols) + Right Grid (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filter (3 cols) */}
          <aside className="lg:col-span-3 bg-white border border-[#D8D8D8] rounded p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
                Filter Inventory
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-[#D01F26] font-bold hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Keyword / Chassis
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={onChange}
                placeholder="Search model, chassis, grade..."
                className="form-input-grounded text-xs py-2 bg-white"
              />
            </div>

            {/* Make */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Make
              </label>
              <input
                type="text"
                name="make"
                value={filters.make}
                onChange={onChange}
                placeholder="e.g. Toyota, Nissan, Honda"
                className="form-input-grounded text-xs py-2 bg-white"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={filters.model}
                onChange={onChange}
                placeholder="e.g. Land Cruiser, Supra"
                className="form-input-grounded text-xs py-2 bg-white"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Year Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="yearMin"
                  value={filters.yearMin}
                  onChange={onChange}
                  placeholder="Min Year"
                  className="form-input-grounded text-xs py-2 bg-white"
                />
                <input
                  type="number"
                  name="yearMax"
                  value={filters.yearMax}
                  onChange={onChange}
                  placeholder="Max Year"
                  className="form-input-grounded text-xs py-2 bg-white"
                />
              </div>
            </div>

            {/* Price (USD FOB) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Price (USD FOB)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={onChange}
                  placeholder="Min $"
                  className="form-input-grounded text-xs py-2 bg-white"
                />
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={onChange}
                  placeholder="Max $"
                  className="form-input-grounded text-xs py-2 bg-white"
                />
              </div>
            </div>

            {/* Body Style Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
                Body Style
              </label>
              <div className="space-y-1.5 text-xs text-[#555555]">
                {BODY_STYLES.map((style) => (
                  <label key={style} className="flex items-center gap-2 cursor-pointer hover:text-[#1A1A1A]">
                    <input
                      type="radio"
                      name="search"
                      value={style}
                      checked={filters.search === style}
                      onChange={onChange}
                      className="text-[#D01F26] focus:ring-[#D01F26]"
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => fetch(filters, 1)}
              className="btn-tapro-red w-full py-2.5 text-xs font-bold"
            >
              Apply Filters
            </button>
          </aside>

          {/* Right Main Grid (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar (Sort & Count) */}
            <div className="bg-white border border-[#D8D8D8] rounded p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="font-mono text-[#555555]">
                Showing <strong>{data.data.length}</strong> of <strong>{data.total}</strong> units
              </span>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1A1A1A]">Sort by:</span>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={onChange}
                  className="form-input-grounded text-xs py-1.5 px-3 bg-white w-auto"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error state */}
            {error && <div className="text-center text-[#D01F26] font-bold py-12">{error}</div>}

            {/* Loading Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[#D8D8D8] rounded h-72 animate-pulse" />
                ))}
              </div>
            ) : data.data.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#D8D8D8] rounded">
                <p className="text-sm font-mono text-[#777777]">No vehicles match your selected criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-xs font-bold text-[#D01F26] hover:underline font-mono"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {data.data.map(v => {
                  const price = Number(v.starting_price ?? 0)
                  const title = v.title || `${v.make} ${v.model} ${v.year}`
                  const grade = v.grade || '4.5'
                  const mileage = v.mileage != null ? Number(v.mileage).toLocaleString() + ' km' : 'Verified'

                  return (
                    <Link
                      key={v.id}
                      to={`/vehicles/${v.id}`}
                      className="lot-card flex flex-col bg-white group"
                    >
                      {/* Photo Container */}
                      <div className="relative aspect-[4/3] bg-[#1A1A1A] overflow-hidden border-b border-[#D8D8D8]">
                        {v.images?.[0] ? (
                          <img
                            src={toMediaUrl(v.images[0])}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#777777] font-mono text-xs">
                            [INSPECTION PHOTO]
                          </div>
                        )}

                        <div className="absolute top-2 left-2 bg-[#1A1A1A]/95 text-white text-[10px] font-mono px-2 py-0.5 rounded border border-[#333333]">
                          STOCK #{v.id}
                        </div>

                        <div className="absolute top-2 right-2 badge-grade">
                          GRADE {grade}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] mb-1">
                            <span>{v.year || '2020'} · {v.make}</span>
                            <span className="text-slate-500 font-semibold">Stock #{v.id}</span>
                          </div>

                          <h2 className="font-extrabold text-[#1A1A1A] text-base leading-snug line-clamp-1 group-hover:text-[#D01F26] transition-colors" title={title}>
                            {title}
                          </h2>

                          {/* Technical Spec Row */}
                          <div className="mt-2 text-[11px] font-mono text-[#555555] bg-[#FAF8F5] border border-[#E8E8E8] px-2 py-1.5 rounded flex items-center justify-between">
                            <span>{mileage}</span>
                            <span>·</span>
                            <span>{v.transmission || 'Automatic'}</span>
                            <span>·</span>
                            <span>{v.fuel_type || 'Petrol'}</span>
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="pt-3 border-t border-[#E8E8E8] flex items-center justify-between">
                          <div>
                            <span className="block text-[9px] font-mono uppercase text-[#777777]">FOB Price (Japan)</span>
                            <span className="text-base font-black text-[#D01F26] font-mono">
                              USD {price > 0 ? price.toLocaleString() : 'Inquire'}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#D01F26] group-hover:translate-x-1 transition-all">
                            Inspect →
                          </span>
                        </div>

                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded border border-[#D8D8D8] text-xs font-bold bg-white disabled:opacity-40 hover:bg-[#FAF8F5]"
                >
                  ← Prev
                </button>
                <span className="text-xs font-mono px-3 py-1.5 bg-white border border-[#D8D8D8] rounded font-bold">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="px-3 py-1.5 rounded border border-[#D8D8D8] text-xs font-bold bg-white disabled:opacity-40 hover:bg-[#FAF8F5]"
                >
                  Next →
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  )
}
