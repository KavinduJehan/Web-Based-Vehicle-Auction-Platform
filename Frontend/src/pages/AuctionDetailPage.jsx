import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAuction, closeAuction, setWinner } from '../api/auctions'
import { listBids, placeBid } from '../api/bids'
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
                  alt={auction.title}
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
                        alt={`${auction.title} ${i + 1}`}
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

        {/* Right Column: Details & Bidding */}
        <div className="w-full lg:w-5/12 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {auction.title}
              </h1>
              <div className="mt-2">
                <StatusBadge status={auction.status} />
              </div>
            </div>
          </div>

          {/* Current highest bid */}
          <div className={`border rounded-lg p-5 shadow-sm ${
            reserveMet === true  ? 'bg-green-50 border-green-200' :
            reserveMet === false ? 'bg-red-50 border-red-200'    :
            'bg-gray-50 border-gray-200'
          }`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Current highest bid</p>
            <p className={`text-4xl font-bold ${
              reserveMet === true  ? 'text-green-600' :
              reserveMet === false ? 'text-red-600'   :
              'text-blue-600'
            }`}>
              {highest != null
                ? `USD ${highest.toLocaleString()}`
                : `Starting at USD ${Number(auction.starting_price ?? 0).toLocaleString()}`}
            </p>
            
            <div className="flex items-center flex-wrap gap-3 mt-3">
              <p className="text-sm font-medium text-gray-600">
                {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
              </p>
              {reserveMet === true && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Reserve met
                </span>
              )}
              {reserveMet === false && (
                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                  Reserve not met
                </span>
              )}
              {isAdmin && reservePrice != null && (
                <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  Reserve: USD {reservePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Meta Information (Time, Increment) */}
          <div>
            <div className="border-b border-red-200 mb-4 pb-2">
              <h2 className="text-2xl font-light text-gray-800">Auction Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              {auction.starts_at && (
                <div className="flex gap-2">
                  <span className="font-bold text-gray-900 w-1/3 shrink-0">Starts</span>
                  <span className="text-gray-700">{new Date(auction.starts_at).toLocaleString()}</span>
                </div>
              )}
              {auction.ends_at && (
                <div className="flex gap-2">
                  <span className="font-bold text-gray-900 w-1/3 shrink-0">Ends</span>
                  <span className="text-gray-700 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span>{new Date(auction.ends_at).toLocaleString()}</span>
                    {auction.status === 'active' && (
                      <span className="font-semibold text-red-600 whitespace-nowrap"><CountdownTimer endsAt={auction.ends_at} /></span>
                    )}
                  </span>
                </div>
              )}
              {increment > 0 && (
                <div className="flex gap-2">
                  <span className="font-bold text-gray-900 w-1/3 shrink-0">Increment</span>
                  <span className="text-gray-700">USD {increment.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Other Details */}
          {auction.description && (
            <div>
              <div className="border-b border-red-200 mb-4 pb-2">
                <h2 className="text-2xl font-light text-gray-800">Other Details</h2>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {auction.description}
              </p>
            </div>
          )}

          {/* Bid form */}
          {canBid && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Place a Bid</h2>
              {!isVerified ? (
                <div className="bg-yellow-50 text-yellow-800 rounded p-3 text-sm border border-yellow-200">
                  Your account is pending admin verification. You cannot place bids yet.
                </div>
              ) : (
                <form onSubmit={handleBid} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (minimum USD {minNext.toLocaleString()})
                    </label>
                    <input
                      type="number" min={minNext} step="1" required
                      value={amount} onChange={e => setAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder={`e.g. ${minNext}`}
                    />
                  </div>
                  <button
                    type="submit" disabled={bidLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    {bidLoading ? 'Placing…' : 'Place Bid'}
                  </button>
                </form>
              )}
              {bidError   && <p className="text-red-600 text-sm mt-2">{bidError}</p>}
              {bidSuccess && <p className="text-green-600 text-sm mt-2 font-medium">{bidSuccess}</p>}
            </div>
          )}

          {/* Not logged in nudge */}
          {auction.status === 'active' && !user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <Link to="/login" className="font-semibold hover:underline">Sign in</Link> to place a bid.
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 space-y-4">
              <h2 className="font-semibold text-orange-900">Admin Controls</h2>

              {/* Close button */}
              {auction.status !== 'ended' && (
                <div>
                  <button
                    onClick={handleClose} disabled={closeLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {closeLoading ? 'Closing…' : 'Close Auction'}
                  </button>
                  {closeError && <p className="text-red-600 text-sm mt-2">{closeError}</p>}
                </div>
              )}

              {/* Select winner */}
              {auction.status === 'ended' && !auction.winning_bid_id && (
                <div>
                  <p className="text-sm text-orange-800 mb-2 font-medium">Select the winning bid:</p>
                  {sortedBids.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-white p-3 border rounded">No bids were placed.</p>
                  ) : (
                    <div className="border border-orange-200 rounded overflow-hidden">
                      <table className="w-full text-sm bg-white">
                        <thead className="bg-orange-100/50">
                          <tr className="text-left text-orange-800 text-xs uppercase">
                            <th className="px-3 py-2 font-semibold">Amount</th>
                            <th className="px-3 py-2 font-semibold">Bidder</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-100">
                          {sortedBids.map((b) => (
                            <tr key={b.id} className="hover:bg-orange-50/50">
                              <td className="px-3 py-2 font-medium">USD {Number(b.amount).toLocaleString()}</td>
                              <td className="px-3 py-2 text-gray-700">{b.bidder_name ?? '—'}</td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  onClick={() => handleSelectWinner(b.id)}
                                  disabled={winnerLoading === b.id}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition-colors disabled:opacity-50"
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
                  {winnerError && <p className="text-red-600 text-sm mt-2">{winnerError}</p>}
                </div>
              )}

              {auction.status === 'ended' && auction.winning_bid_id && (
                <p className="text-sm text-green-700 font-medium bg-green-50 p-3 rounded border border-green-200">
                  Winner assigned.{' '}
                  <Link to={`/auctions/${id}/winner`} className="underline ml-1">View winner →</Link>
                </p>
              )}
            </div>
          )}

          {/* Winner banner (buyers) */}
          {auction.status === 'ended' && !isAdmin && (
            <Link
              to={`/auctions/${id}/winner`}
              className="block bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800 hover:bg-purple-100 transition-colors text-center font-medium"
            >
              This auction has ended — view winner →
            </Link>
          )}

        </div>
      </div>

      {/* Bid history Full Width Below */}
      {sortedBids.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="border-b border-red-200 mb-6 pb-2 inline-block">
            <h2 className="text-2xl font-light text-gray-800">Bid History</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-4xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Bidder</th>
                    <th className="px-6 py-4 font-semibold">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedBids.map((b, i) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {i === 0 && <span className="text-green-600 mr-2" title="Highest Bid">★</span>}
                        USD {Number(b.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{b.bidder_name ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
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
  )
}
