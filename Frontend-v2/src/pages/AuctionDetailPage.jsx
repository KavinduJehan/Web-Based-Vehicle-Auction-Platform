import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAuction, closeAuction, setWinner } from '../api/auctions'
import { listBids, placeBid } from '../api/bids'
import { useri} from '../api/bids'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import Spinner from '../components/Spinner'
import { toMediaUrl } from '../utils/mediaUrl'


export default function AuctionDetailPage() {
  const { id } = useParams()
  const { user, isVerified, isAdmin } = useAuth()

  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [amount, setAmount] = useState('')
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState('')
  const [bidLoading, setBidLoading] = useState(false)
  const [closeLoading, setCloseLoading] = useState(false)
  const [closeError, setCloseError] = useState('')
  const [winnerLoading, setWinnerLoading] = useState(null)
  const [winnerError, setWinnerError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const load = useCallback(async () => {
    const [aRes, bRes] = await Promise.all([
      getAuction(id),
      listBids(id).catch(() => ({ data: [] })),
    ])
    setAuction(aRes.data)
    setBids(bRes.data)
  }, [id])

  useEffect(() => {
    load().catch(() => setError('Failed to load auction')).finally(() => setLoading(false))
  }, [load])

  // Poll every 15 s while the auction is active so all users see the latest bids
  useEffect(() => {
    if (!auction || auction.status !== 'active') return
    const interval = setInterval(() => load().catch(() => {}), 15000)
    return () => clearInterval(interval)
  }, [auction?.status, load])

  // Lightbox helpers — depend on images derived after auction loads
  const images = auction?.vehicle_images ?? []
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

  async function handleClose() {
    if (!window.confirm('Close this auction now? This cannot be undone.')) return
    setCloseError('')
    setCloseLoading(true)
    try {
      await closeAuction(id)
      await load()
    } catch (err) {
      setCloseError(err.response?.data?.message ?? 'Failed to close auction')
    } finally {
      setCloseLoading(false)
    }
  }

  async function handleSelectWinner(bidId) {
    if (!window.confirm('Assign this bid as the winner?')) return
    setWinnerError('')
    setWinnerLoading(bidId)
    try {
      await setWinner(id, bidId)
      await load()
    } catch (err) {
      setWinnerError(err.response?.data?.message ?? 'Failed to set winner')
    } finally {
      setWinnerLoading(null)
    }
  }

  async function handleBid(e) {
    e.preventDefault()
    setBidError('')
    setBidSuccess('')
    setBidLoading(true)
    try {
      await placeBid(id, Number(amount))
      setBidSuccess('Bid placed successfully!')
      setAmount('')
      await load()
    } catch (err) {
      setBidError(err.response?.data?.message ?? 'Failed to place bid')
    } finally {
      setBidLoading(false)
    }
  }

  if (loading) return <Spinner />
  if (error || !auction) return (
    <div className="p-12 text-center">
      <p className="text-red-600 font-medium">{error || 'Auction not found'}</p>
    </div>
  )

  const sortedBids = [...bids].sort((a, b) => Number(b.amount) - Number(a.amount))
  const highest = sortedBids.length > 0 ? Number(sortedBids[0].amount) : null
  const increment = Number(auction.min_increment ?? 0)
  const minNext = highest != null
    ? highest + (increment > 0 ? increment : 1)
    : Number(auction.starting_price ?? 0)

  // Reserve price — only present in the response for admins
  const reservePrice = auction.reserve_price != null ? Number(auction.reserve_price) : null
  // reserve_met: null = no reserve, true/false = met status (computed server-side)
  const reserveMet = auction.reserve_met  // null | true | false

  const canBid = auction.status === 'active' && user && !isAdmin

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link Breadcrumb */}
        <div className="mb-6 pb-3 border-b border-[#D8D8D8] flex items-center justify-between">
          <Link
            to="/auctions"
            className="text-xs font-mono font-bold text-[#D01F26] hover:underline inline-flex items-center gap-1.5"
          >
            &larr; BACK TO AUCTION CATALOG
          </Link>
          <span className="text-xs font-mono text-[#555555]">
            LOT #{auction.id}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Images */}
          <div className="w-full lg:w-7/12 space-y-4">
            {images.length > 0 ? (
              <div>
                {/* Hero image — click to open lightbox */}
                <div
                  className="relative group cursor-zoom-in overflow-hidden rounded border border-[#D8D8D8] bg-[#1A1A1A] shadow-xs aspect-[4/3]"
                  onClick={() => openLightbox(activeIdx)}
                >
                  <img
                    src={toMediaUrl(images[activeIdx])}
                    alt={auction.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono font-bold uppercase tracking-wider bg-black/75 px-3 py-1.5 rounded shadow-lg border border-white/20">
                      Click to Inspect
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
                          ${i === activeIdx ? 'border-[#D01F26] ring-1 ring-[#D01F26]' : 'border-[#D8D8D8]'}`}
                        onClick={() => setActiveIdx(i)}
                      >
                        <img
                          src={toMediaUrl(url)}
                          alt={`${auction.title} ${i + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-white rounded border border-[#D8D8D8] flex items-center justify-center text-[#777777] font-mono text-xs">
                No inspection photos available
              </div>
            )}
          </div>

          {/* Right Column: Details & Bidding */}
          <div className="w-full lg:w-5/12 space-y-6">
            
            {/* Header */}
            <div>
              <div className="text-[11px] font-mono font-bold text-[#D01F26] uppercase tracking-widest">
                VERIFIED AUCTION LOT
              </div>
              <div className="flex items-start justify-between gap-4 mt-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight leading-tight">
                  {auction.title}
                </h1>
                <div className="shrink-0 mt-1">
                  <StatusBadge status={auction.status} />
                </div>
              </div>
            </div>

            {/* Current highest bid */}
            <div className={`border border-[#D8D8D8] rounded p-5 shadow-xs bg-white`}>
              <p className="text-[11px] text-[#777777] font-mono uppercase tracking-wider font-bold mb-1">Current Highest Bid</p>
              <p className="text-3xl sm:text-4xl font-black text-[#D01F26] tracking-tight">
                {highest != null
                  ? `USD ${highest.toLocaleString()}`
                  : `Starting at USD ${Number(auction.starting_price ?? 0).toLocaleString()}`}
              </p>
              
              <div className="flex items-center flex-wrap gap-3 mt-3 pt-3 border-t border-[#EAEAEA]">
                <p className="text-xs font-mono font-bold text-[#555555]">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
                </p>
                {reserveMet === true && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                    </svg>
                    Reserve met
                  </span>
                )}
                {reserveMet === false && (
                  <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono">
                    Reserve not met
                  </span>
                )}
                {isAdmin && reservePrice != null && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">
                    Reserve: USD {reservePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Meta Information (Time, Increment) */}
            <div className="bg-white border border-[#D8D8D8] rounded p-5 shadow-xs space-y-3">
              <div className="border-b border-[#EAEAEA] pb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Auction Schedule &amp; Terms</h2>
              </div>
              <div className="grid grid-cols-1 gap-y-2.5 text-xs">
                {auction.starts_at && (
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="font-bold text-[#777777] uppercase font-mono">Starts</span>
                    <span className="text-[#1A1A1A] font-semibold">{new Date(auction.starts_at).toLocaleString()}</span>
                  </div>
                )}
                {auction.ends_at && (
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="font-bold text-[#777777] uppercase font-mono">Ends</span>
                    <span className="text-[#1A1A1A] font-semibold flex items-center gap-2">
                      <span>{new Date(auction.ends_at).toLocaleString()}</span>
                      {auction.status === 'active' && (
                        <span className="font-bold text-[#D01F26] font-mono"><CountdownTimer endsAt={auction.ends_at} /></span>
                      )}
                    </span>
                  </div>
                )}
                {increment > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-[#777777] uppercase font-mono">Min. Increment</span>
                    <span className="text-[#1A1A1A] font-bold font-mono">USD {increment.toLocaleString()}</span>
                  </div>
                )}
              </div>
            {/* Other Details */}
            {auction.description && (
              <div className="bg-white border border-[#D8D8D8] rounded p-5 shadow-xs space-y-2">
                <div className="border-b border-[#EAEAEA] pb-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Lot Notes &amp; Inspection Summary</h2>
                </div>
                <p className="text-[#555555] text-xs whitespace-pre-wrap leading-relaxed">
                  {auction.description}
                </p>
              </div>
            )}

            {/* Bid form */}
            {canBid && (
              <div className="bg-white border border-[#D8D8D8] shadow-xs rounded p-5">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A] mb-3">Place a Verified Bid</h2>
                {!isVerified ? (
                  <div className="bg-amber-50 text-amber-800 rounded p-3 text-xs border border-amber-200">
                    Your account is pending export manager verification. You cannot place bids yet.
                  </div>
                ) : (
                  <form onSubmit={handleBid} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                        Amount (minimum USD {minNext.toLocaleString()})
                      </label>
                      <input
                        type="number" min={minNext} step="1" required
                        value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full bg-white border border-[#D8D8D8] rounded px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D01F26] focus:ring-1 focus:ring-[#D01F26]"
                        placeholder={`e.g. ${minNext}`}
                      />
                    </div>
                    <button
                      type="submit" disabled={bidLoading}
                      className="btn-tapro-red w-full py-2.5 text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                    >
                      {bidLoading ? 'Submitting Bid…' : 'Submit Bid Offer'}
                    </button>
                  </form>
                )}
                {bidError   && <p className="text-[#D01F26] text-xs font-bold mt-2">{bidError}</p>}
                {bidSuccess && <p className="text-emerald-700 text-xs font-bold mt-2">{bidSuccess}</p>}
              </div>
            )}

            {/* Not logged in nudge */}
            {auction.status === 'active' && !user && (
              <div className="bg-[#FAF8F5] border border-[#D8D8D8] rounded p-4 text-xs text-[#555555]">
                <Link to="/login" className="font-bold text-[#D01F26] hover:underline">Sign in to your client account</Link> to place a live bid on this lot.
              </div>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <div className="bg-white border border-[#D8D8D8] rounded p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]">Admin Operations Desk</h2>

                {/* Close button */}
                {auction.status !== 'ended' && (
                  <div>
                    <button
                      onClick={handleClose} disabled={closeLoading}
                      className="bg-[#1A1A1A] hover:bg-black text-white font-bold px-4 py-2 rounded text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {closeLoading ? 'Closing…' : 'Close Auction Lot'}
                    </button>
                    {closeError && <p className="text-[#D01F26] text-xs mt-2">{closeError}</p>}
                  </div>
                )}

                {/* Select winner */}
                {auction.status === 'ended' && !auction.winning_bid_id && (
                  <div>
                    <p className="text-xs text-[#555555] mb-2 font-medium">Select winning buyer bid:</p>
                    {sortedBids.length === 0 ? (
                      <p className="text-xs text-[#777777] bg-[#FAF8F5] p-3 border border-[#EAEAEA] rounded font-mono">No bids placed during session.</p>
                    ) : (
                      <div className="border border-[#D8D8D8] rounded overflow-hidden">
                        <table className="w-full text-xs bg-white font-mono">
                          <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                            <tr className="text-left text-[#1A1A1A] text-[10px] uppercase">
                              <th className="px-3 py-2 font-bold">Amount</th>
                              <th className="px-3 py-2 font-bold">Bidder</th>
                              <th className="px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EAEAEA]">
                            {sortedBids.map((b) => (
                              <tr key={b.id} className="hover:bg-[#FAF8F5]">
                                <td className="px-3 py-2 font-bold text-[#1A1A1A]">USD {Number(b.amount).toLocaleString()}</td>
                                <td className="px-3 py-2 text-[#555555]">{b.bidId ?? '—'}</td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    onClick={() => handleSelectWinner(b.id)}
                                    disabled={winnerLoading === b.id}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    {winnerLoading === b.id ? '…' : 'Select'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {winnerError && <p className="text-[#D01F26] text-xs mt-2">{winnerError}</p>}
                  </div>
                )}

                {auction.status === 'ended' && auction.winning_bid_id && (
                  <p className="text-xs text-emerald-800 font-bold bg-emerald-50 p-3 rounded border border-emerald-200">
                    Winner assigned.{' '}
                    <Link to={`/auctions/${id}/winner`} className="text-[#D01F26] underline ml-1">View winner details &rarr;</Link>
                  </p>
                )}
              </div>
            )}

            {/* Winner banner (buyers) */}
            {auction.status === 'ended' && !isAdmin && (
              <Link
                to={`/auctions/${id}/winner`}
                className="block bg-white border border-[#D8D8D8] rounded p-4 text-xs text-[#1A1A1A] hover:border-[#D01F26] transition-colors text-center font-bold shadow-xs"
              >
                This auction lot has closed — view official winner announcement &rarr;
              </Link>
            )}

          </div>
        </div>

        {/* Bid history Full Width Below */}
        {sortedBids.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#D8D8D8]">
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
                AUDIT TRAIL
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight mt-0.5">
                Verified Bid History
              </h2>
            </div>
            <div className="bg-white border border-[#D8D8D8] rounded overflow-hidden shadow-xs max-w-4xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                    <tr className="text-left text-[#777777] text-[10px] uppercase tracking-wider font-mono">
                      <th className="px-5 py-3 font-bold">Offer Amount</th>
                      <th className="px-5 py-3 font-bold">Bid Reference</th>
                      <th className="px-5 py-3 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {sortedBids.map((b, i) => (
                      <tr key={b.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-5 py-3 font-bold text-[#1A1A1A] whitespace-nowrap font-mono">
                          {i === 0 && (
                            <span className="text-emerald-600 mr-2 inline-flex items-center" title="Highest Bid">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </span>
                          )}
                          USD {Number(b.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[#555555] whitespace-nowrap font-mono">{b.id ?? '—'}</td>
                        <td className="px-5 py-3 text-[#777777] whitespace-nowrap font-mono">
                          {new Date(b.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors p-2" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {images.length > 1 && (
            <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/90 font-mono text-xs tracking-widest z-10 bg-black/80 border border-white/20 px-3 py-1 rounded">
              {activeIdx + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-6xl leading-none z-10 p-4 transition-colors" aria-label="Previous">‹</button>
          )}

          <img
            src={toMediaUrl(images[activeIdx])}
            alt={`${auction.title} ${activeIdx + 1}`}
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
  </div>
  )
}
