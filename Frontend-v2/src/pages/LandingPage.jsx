import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listVehicles } from '../api/vehicles'
import { toMediaUrl } from '../utils/mediaUrl'
import { DEALER_CONFIG } from '../config/appConfig'

// Official Japanese Automotive Brands
const POPULAR_MAKES = [
  { name: 'Toyota', logo: '/brands/toyota.svg' },
  { name: 'Nissan', logo: '/brands/nissan.svg' },
  { name: 'Honda', logo: '/brands/honda.svg' },
  { name: 'Mazda', logo: '/brands/mazda.svg' },
  { name: 'Mitsubishi', logo: '/brands/mitsubishi.svg' },
  { name: 'Subaru', logo: '/brands/subaru.svg' },
  { name: 'Suzuki', logo: '/brands/suzuki.svg' },
  { name: 'Lexus', logo: '/brands/lexus.svg' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState(new Set([1, 2, 'supra']))
  
  // Dynamic Real Inventory State from Database
  const [dbVehicles, setDbVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  // Search filter state in hero
  const [searchMake, setSearchMake] = useState('All Makes')
  const [searchModel, setSearchModel] = useState('')
  const [searchYear, setSearchYear] = useState('Any Year')

  // Fetch real inventory from database
  useEffect(() => {
    let isMounted = true
    setLoadingVehicles(true)
    listVehicles({ limit: 8, sortBy: 'created_at', order: 'desc' })
      .then(res => {
        if (!isMounted) return
        const list = res.data?.data || []
        setDbVehicles(list)
      })
      .catch(() => {
        if (!isMounted) return
        setDbVehicles([])
      })
      .finally(() => {
        if (isMounted) setLoadingVehicles(false)
      })
    return () => { isMounted = false }
  }, [])

  function handleHeroSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchMake && searchMake !== 'All Makes') params.set('make', searchMake)
    if (searchModel.trim()) params.set('search', searchModel.trim())
    if (searchYear && searchYear !== 'Any Year') params.set('yearMin', searchYear)
    navigate(`/vehicles?${params.toString()}`)
  }

  function handleFilterByMake(makeName) {
    navigate(`/vehicles?make=${encodeURIComponent(makeName)}`)
  }

  function toggleWatchlist(id, e) {
    e.preventDefault()
    e.stopPropagation()
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen">
      
      {/* ── HERO BANNER WITH YOKOHAMA DOCK BACKGROUND & GROUNDED SEARCH (SCREEN-FITTING VIEWPORT) ── */}
      <section className="relative text-white pt-6 pb-6 lg:pt-8 lg:pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#2C2C2C]">
        
        {/* User-Provided Yokohama Export Terminal Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/landingpagebackground.jpg"
            alt="Yokohama Export Terminal"
            className="w-full h-full object-cover object-center"
          />
          {/* Deep Harbor Atmospheric Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B111E]/95 via-[#0B111E]/80 to-transparent" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Main Hero Content Split: Text & Search on Left Half */}
          <div className="max-w-2xl space-y-4">
            
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-[0.2em] text-[#D8D8D8] uppercase flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#D01F26] inline-block" />
                DIRECT VEHICLE EXPORT
              </p>
              
              {/* Solid High-Contrast Typography (No Gradients) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-[1.08] text-white">
                Quality Vehicles.<br />
                <span className="text-[#D01F26]">
                  Global Opportunities.
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-[#EAEAEA] leading-relaxed font-normal max-w-xl">
                Direct access to verified automotive stock. Transparent FOB quotations, rigorous physical inspections, and worldwide shipping logistics.
              </p>
            </div>

            {/* Elevated Search Card (Transparent Frosted Glass, Compact 4px Rounded) */}
            <div className="bg-[#0B111E]/60 backdrop-blur-md rounded p-4 sm:p-5 shadow-2xl border border-white/20 text-white max-w-xl">
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#D01F26]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Vehicle Inventory
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  Direct Stock
                </span>
              </div>

              <form onSubmit={handleHeroSearch} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Make Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Make
                    </label>
                    <select
                      value={searchMake}
                      onChange={e => setSearchMake(e.target.value)}
                      className="w-full bg-[#0B111E]/90 border border-white/25 text-white text-xs font-semibold rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#D01F26] focus:border-[#D01F26]"
                    >
                      <option value="All Makes" className="bg-[#0B111E] text-white">Select Make</option>
                      <option value="Toyota" className="bg-[#0B111E] text-white">Toyota</option>
                      <option value="Nissan" className="bg-[#0B111E] text-white">Nissan</option>
                      <option value="Honda" className="bg-[#0B111E] text-white">Honda</option>
                      <option value="Mazda" className="bg-[#0B111E] text-white">Mazda</option>
                      <option value="Mitsubishi" className="bg-[#0B111E] text-white">Mitsubishi</option>
                      <option value="Subaru" className="bg-[#0B111E] text-white">Subaru</option>
                      <option value="Suzuki" className="bg-[#0B111E] text-white">Suzuki</option>
                      <option value="Lexus" className="bg-[#0B111E] text-white">Lexus</option>
                    </select>
                  </div>

                  {/* Model Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={searchModel}
                      onChange={e => setSearchModel(e.target.value)}
                      placeholder="e.g. Land Cruiser"
                      className="w-full bg-[#0B111E]/90 border border-white/25 text-white placeholder-slate-400 text-xs font-semibold rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#D01F26] focus:border-[#D01F26]"
                    />
                  </div>

                  {/* Year Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Year
                    </label>
                    <select
                      value={searchYear}
                      onChange={e => setSearchYear(e.target.value)}
                      className="w-full bg-[#0B111E]/90 border border-white/25 text-white text-xs font-semibold rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#D01F26] focus:border-[#D01F26]"
                    >
                      <option value="Any Year" className="bg-[#0B111E] text-white">Any Year</option>
                      <option value="2024" className="bg-[#0B111E] text-white">2024</option>
                      <option value="2023" className="bg-[#0B111E] text-white">2023</option>
                      <option value="2022" className="bg-[#0B111E] text-white">2022</option>
                      <option value="2021" className="bg-[#0B111E] text-white">2021</option>
                      <option value="2020" className="bg-[#0B111E] text-white">2020</option>
                      <option value="2019" className="bg-[#0B111E] text-white">2019</option>
                      <option value="2018" className="bg-[#0B111E] text-white">2018</option>
                    </select>
                  </div>

                </div>

                <button
                  type="submit"
                  className="btn-tapro-red w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Vehicles</span>
                </button>
              </form>
            </div>

          </div>

          {/* 4 Legitimate Trust Pillars (Sleek Horizontal Status Ribbon) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#0B111E]/85 backdrop-blur-md rounded px-3 py-2 flex items-center gap-2.5 border border-white/10">
              <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white tracking-tight truncate">Verified Sourcing</div>
                <div className="text-[10px] text-slate-300 truncate">Curated Dealerships</div>
              </div>
            </div>

            <div className="bg-[#0B111E]/85 backdrop-blur-md rounded px-3 py-2 flex items-center gap-2.5 border border-white/10">
              <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white tracking-tight truncate">Inspections</div>
                <div className="text-[10px] text-slate-300 truncate">Detailed Photo Reports</div>
              </div>
            </div>

            <div className="bg-[#0B111E]/85 backdrop-blur-md rounded px-3 py-2 flex items-center gap-2.5 border border-white/10">
              <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white tracking-tight truncate">Port Logistics</div>
                <div className="text-[10px] text-slate-300 truncate">Commercial Dispatch</div>
              </div>
            </div>

            <div className="bg-[#0B111E]/85 backdrop-blur-md rounded px-3 py-2 flex items-center gap-2.5 border border-white/10">
              <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white tracking-tight truncate">Dedicated Desks</div>
                <div className="text-[10px] text-slate-300 truncate">Malawi, UK &amp; Tokyo</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── POPULAR MAKES STRIP (VEHICLES COLOR PALETTE: BORDER #D8D8D8, TEXT #1A1A1A) ── */}
      <section className="bg-white border-b border-[#D8D8D8] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black tracking-[0.16em] text-[#1A1A1A] uppercase font-mono">
              POPULAR MAKES
            </h2>
            <Link to="/vehicles" className="text-xs font-bold text-[#555555] hover:text-[#D01F26] flex items-center gap-1 transition">
              <span>View All Makes</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {POPULAR_MAKES.map(m => (
              <button
                key={m.name}
                onClick={() => handleFilterByMake(m.name)}
                className="bg-white border border-[#D8D8D8] rounded p-2.5 flex flex-col items-center justify-center gap-1.5 group hover:border-[#D01F26] hover:shadow-md transition-all cursor-pointer text-[#1A1A1A] hover:text-[#D01F26]"
              >
                <div className="h-10 w-full flex items-center justify-center">
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="h-8 max-w-[48px] object-contain transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-black font-mono tracking-wider text-[#1A1A1A] group-hover:text-[#D01F26] uppercase transition-colors">
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL DATABASE VEHICLE LISTINGS (DYNAMICALLY LOADED FROM BACKEND) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D8D8D8] pb-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-[#D01F26] mb-1">
              <span>CURRENT INVENTORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
              Vehicle Listings
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Explore inspected motor vehicles ready for immediate port dispatch and international shipping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#555555] bg-white px-3 py-1.5 rounded border border-[#D8D8D8]">
              <span className="text-[#D01F26] font-extrabold">{dbVehicles.length}</span> Units Available
            </span>
            <Link
              to="/vehicles"
              className="text-xs font-bold text-[#D01F26] hover:underline flex items-center gap-1"
            >
              <span>Explore All Stock</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Dynamic Database Vehicle Grid */}
        {loadingVehicles ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#D8D8D8] rounded h-72 animate-pulse" />
            ))}
          </div>
        ) : dbVehicles.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#D8D8D8] rounded p-6">
            <p className="text-sm text-[#777777] font-mono">No inventory records currently available.</p>
            <Link to="/vehicles" className="mt-2 inline-block text-xs font-bold text-[#D01F26] hover:underline">
              Browse vehicle catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dbVehicles.map(car => {
              const price = Number(car.starting_price ?? 0)
              const title = car.title || `${car.make} ${car.model} ${car.year}`
              const grade = car.grade || '4.5'
              const mileage = car.mileage != null ? Number(car.mileage).toLocaleString() + ' km' : 'Verified'
              const isSaved = watchlist.has(car.id)
              const photo = car.images?.[0] ? toMediaUrl(car.images[0]) : '/vehicles/land_cruiser_300.jpg'

              return (
                <div
                  key={car.id}
                  className="bg-white border border-[#D8D8D8] rounded overflow-hidden flex flex-col justify-between group hover:border-[#D01F26] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/vehicles/${car.id}`)}
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden border-b border-[#EAEAEA]">
                      <img
                        src={photo}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Left Grade Pill */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-black tracking-wider border border-white/20">
                        GRADE {grade}
                      </span>

                      {/* Top Right Heart Watchlist Button */}
                      <button
                        onClick={(e) => toggleWatchlist(car.id, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition"
                        aria-label="Save to watchlist"
                      >
                        <svg className={`w-3.5 h-3.5 ${isSaved ? 'text-[#D01F26] fill-[#D01F26]' : 'text-[#777777]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* Bottom Left Stock Badge */}
                      <span className="absolute bottom-2 left-2.5 text-[9px] font-mono font-bold text-white bg-black/75 px-1.5 py-0.5 rounded">
                        STOCK #{car.id}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-[#777777] uppercase tracking-wider">
                        <span>{car.make}</span>
                        <span>{car.year || '2021'}</span>
                      </div>

                      <h3 className="text-sm font-black text-[#1A1A1A] tracking-tight mt-0.5 line-clamp-1 group-hover:text-[#D01F26] transition-colors" title={title}>
                        {title}
                      </h3>

                      <div className="mt-2 text-[10px] font-mono text-[#555555] bg-[#FAF8F5] border border-[#EBEBEB] px-2 py-1 rounded flex items-center justify-between">
                        <span>{mileage}</span>
                        <span>·</span>
                        <span>{car.transmission || 'Automatic'}</span>
                        <span>·</span>
                        <span>{car.fuel_type || 'Petrol'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Price & Details Link */}
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#EAEAEA] flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-mono uppercase text-[#777777]">FOB Price</span>
                      <span className="text-base font-black text-[#D01F26] font-mono">
                        USD {price > 0 ? price.toLocaleString() : 'Inquire'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#555555] group-hover:text-[#D01F26] flex items-center gap-0.5 transition">
                      Details
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </section>

      {/* ── HIGHLIGHTED REGIONAL SALES MANAGERS (VEHICLES PALETTE) ── */}
      <section className="bg-white border-t border-[#D8D8D8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center sm:text-left mb-8">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
              LOCAL BUYER ASSISTANCE &middot; DIRECT REPRESENTATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
              Regional Sales Managers
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] mt-1 max-w-2xl leading-relaxed">
              Connect directly with our appointed regional sales representatives for localized vehicle sourcing consultation, proforma invoice issuance, and port clearance handling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Malawi Regional Sales Manager (Bashir Umar Sumaili) */}
            <div className="bg-white rounded p-5 sm:p-6 border-2 border-[#D01F26]/30 hover:border-[#D01F26] flex flex-col justify-between shadow-xs transition-all">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src="/team/bashir_umar.jpg"
                      alt="Bashir Umar Sumaili"
                      className="w-16 h-16 rounded object-cover border-2 border-[#D01F26] shadow-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-wider mb-0.5">
                      Malawi Regional Desk
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      Bashir Umar Sumaili
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Sales Manager – Malawi
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Cell / WhatsApp Hotline:
                    </span>
                    <a href="tel:+265999224766" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-bold block mt-0.5">
                      +265 999 224 766
                    </a>
                    <a href="tel:+265886000844" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-bold block">
                      +265 886 000 844
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Physical Road &amp; Postal Address:
                    </span>
                    <p className="leading-relaxed mt-0.5 text-[#555555]">
                      M1 Road, Dedza Post Office 22<br />
                      DEDZA DIP, Malawi
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Direct Email:
                    </span>
                    <a href="mailto:bashirumarsumaili@gmail.com" className="text-[#D01F26] hover:underline font-mono break-all font-bold block mt-0.5">
                      bashirumarsumaili@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA] flex gap-2">
                <a
                  href="https://wa.me/265999224766"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.838.814 2.796.814 3.18 0 5.766-2.586 5.767-5.766.001-3.181-2.585-5.766-5.767-5.766zm3.376 8.21c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.071-.497-1.614-.668-2.673-2.302-2.755-2.411-.08-.109-.648-.863-.648-1.646 0-.782.411-1.168.556-1.328.145-.16.317-.2.423-.2.106 0 .211.001.304.006.098.005.231-.037.362.278.135.324.463 1.13.503 1.213.041.082.068.179.014.288-.055.108-.083.175-.164.271-.082.096-.172.214-.246.287-.082.082-.167.171-.072.335.095.163.424.699.911 1.132.628.557 1.157.73 1.32.812.163.082.259.068.355-.041.096-.109.412-.48.521-.645.109-.164.218-.137.367-.082.149.055.945.445 1.108.527.163.082.272.123.312.191.041.069.041.397-.103.802z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:bashirumarsumaili@gmail.com"
                  className="flex-1 text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors inline-flex items-center justify-center"
                >
                  Email Desk
                </a>
              </div>
            </div>

            {/* Card 2: Japan Operations Desk */}
            <div className="bg-white rounded p-5 sm:p-6 border border-[#D8D8D8] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center font-bold text-xs border border-[#D8D8D8]">
                    JP DESK
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#777777] uppercase tracking-wider mb-0.5">
                      Japan Operations
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      Tokyo Headquarters
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Export Desk – Tokyo / Yokohama
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Direct Telephone:
                    </span>
                    <a href="tel:+81364267620" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-bold block mt-0.5">
                      +81 3-6426-7620
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Operations Address:
                    </span>
                    <p className="leading-relaxed mt-0.5 text-[#555555]">
                      1-1-14 Kamiikedai, Ota-ku, Tokyo<br />
                      Yokohama Port Commercial Dispatch
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Central Sales Inquiries:
                    </span>
                    <a href={`mailto:${DEALER_CONFIG.email}`} className="text-[#D01F26] hover:underline font-mono break-all font-bold block mt-0.5">
                      {DEALER_CONFIG.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA]">
                <a
                  href={`mailto:${DEALER_CONFIG.email}`}
                  className="w-full text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors block"
                >
                  Contact Japan Desk
                </a>
              </div>
            </div>

            {/* Card 3: United Kingdom & European Desk */}
            <div className="bg-white rounded p-5 sm:p-6 border border-[#D8D8D8] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded bg-[#FAF8F5] text-[#1A1A1A] flex items-center justify-center font-bold text-xs border border-[#D8D8D8]">
                    UK DESK
                  </div>
                  <div>
                    <p className="text-[11px] font-mono font-bold text-[#777777] uppercase tracking-wider mb-0.5">
                      UK &amp; Europe
                    </p>
                    <h3 className="text-base font-black text-[#1A1A1A] leading-tight">
                      UK Logistics Desk
                    </h3>
                    <p className="text-xs font-semibold text-[#555555] mt-0.5">
                      Logistics Liaison – Southampton
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-[#555555] pt-3 border-t border-[#EAEAEA]">
                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      Hotline &amp; Enquiries:
                    </span>
                    <a href="tel:+442079460912" className="text-[#1A1A1A] hover:text-[#D01F26] font-mono font-bold block mt-0.5">
                      +44 20 7946 0912
                    </a>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      UK Transit Hub:
                    </span>
                    <p className="leading-relaxed mt-0.5 text-[#555555]">
                      Southampton Port Commercial Terminal<br />
                      Hampshire, United Kingdom
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-[#1A1A1A] block text-[10px] uppercase tracking-wider text-[#777777]">
                      European Email:
                    </span>
                    <a href="mailto:uk-desk@taproauto.com" className="text-[#D01F26] hover:underline font-mono break-all font-bold block mt-0.5">
                      uk-desk@taproauto.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAEAEA]">
                <a
                  href="mailto:uk-desk@taproauto.com"
                  className="w-full text-center py-2 px-3 rounded bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold transition-colors block"
                >
                  Contact UK Desk
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
