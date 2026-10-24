import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWinner } from '../api/auctions'
import Spinner from '../components/Spinner'

export default function WinnerPage() {
  const { id } = useParams()
  const [winner, setWinner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWinner(id)
      .then(res => setWinner(res.data))
      .catch(err => setError(err.response?.data?.message ?? 'No winner found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  if (error) return (
    <div className="max-w-lg mx-auto px-6 py-8 text-center">
      <p className="text-gray-500 mb-4">{error}</p>
      <Link to={`/auctions/${id}`} className="text-blue-600 hover:underline text-sm">
        ← Back to auction
      </Link>
    </div>
  )

  return (
    <div className="min-h-[85vh] bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded border border-[#D8D8D8] p-8 text-center shadow-xs">
        <div className="flex justify-center mb-4 text-[#D01F26]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-14 h-14">
            <path d="M6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
            <path d="M18 9h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
            <path d="M4 3h16v7a8 8 0 0 1-16 0V3z" />
            <path d="M12 17v4m-4 0h8" />
          </svg>
        </div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#D01F26] font-bold">
          OFFICIAL AUCTION ALLOCATION
        </div>
        <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mt-1 mb-1">{winner.auctionTitle}</h1>
        <p className="text-[#555555] text-xs mb-6">Auction lot session concluded and verified</p>

        <div className="bg-[#FAF8F5] border border-[#EBEBEB] rounded p-5 text-left space-y-3 mb-6">
          <div>
            <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider mb-0.5">Assigned Winner</p>
            <p className="font-bold text-[#1A1A1A] text-sm">{winner.winner.name}</p>
            <p className="text-xs font-mono text-[#555555]">{winner.winner.email}</p>
          </div>
          <div className="border-t border-[#EAEAEA] pt-3">
            <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider mb-0.5">Winning Bid Amount</p>
            <p className="text-2xl font-black font-mono text-[#D01F26]">
              USD {Number(winner.winningBid.amount).toLocaleString()}
            </p>
            <p className="text-[11px] font-mono text-[#777777] mt-0.5">
              Confirmed on {new Date(winner.winningBid.placedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <Link to="/auctions" className="btn-tapro-red inline-flex text-xs font-bold py-2.5 px-6 rounded">
          &larr; Return to Auction Catalog
        </Link>
      </div>
    </div>
  )
}
