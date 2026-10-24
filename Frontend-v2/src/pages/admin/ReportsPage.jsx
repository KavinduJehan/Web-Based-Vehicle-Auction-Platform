import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { getSummaryReport } from '../../api/reports'
import Spinner from '../../components/Spinner'

const COLORS = ['#1A1A1A', '#D01F26', '#047857', '#B45309', '#4338CA', '#BE185D', '#0F766E', '#6B7280']

const fmt = (n) => Number(n ?? 0).toLocaleString()
const usd = (n) => `USD ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pct = (a, b) => b > 0 ? `${Math.round((a / b) * 100)}%` : '—'
const dt  = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function KPI({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#D8D8D8] rounded p-4 shadow-xs">
      <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777] font-bold">{label}</p>
      <p className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] mt-1">{value}</p>
      {sub && <p className="text-xs text-[#555555] mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeader({ number, title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-5 pb-3 border-b border-[#D8D8D8]">
      <span className="w-7 h-7 rounded bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">{number}</span>
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">{title}</h2>
        {sub && <p className="text-xs text-[#555555] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getSummaryReport()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load report data. Ensure the backend is running.'))
      .finally(() => setLoad(false))
  }, [])

  if (loading) return <div className="bg-[#F8F6F2] min-h-[calc(100vh-140px)] flex items-center justify-center"><Spinner /></div>
  if (error)   return <div className="bg-[#F8F6F2] min-h-[calc(100vh-140px)] flex items-center justify-center p-6"><div className="bg-red-50 border border-red-200 text-[#D01F26] rounded p-4 text-sm max-w-md">{error}</div></div>

  const { overview: o, auctions, buyers, inventory } = data

  const completionRate   = pct(Number(o.completed_sales), Number(o.ended_auctions))
  const verificationRate = pct(Number(o.verified_buyers), Number(o.total_buyers))
  const activeBuyers     = buyers.filter(b => Number(b.total_bids) > 0).length

  return (
    <div className="bg-[#F8F6F2] text-[#1A1A1A] min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Cover ── */}
        <div className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div>
            <p className="text-[11px] font-mono tracking-widest text-[#D01F26] uppercase font-bold">TaproAuto · Management Intelligence</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1A] mt-1">Operational Summary Report</h1>
            <p className="text-xs text-[#555555] mt-1.5">
              Tapro Japan Co., Ltd. &nbsp;·&nbsp; 1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064 &nbsp;·&nbsp; info@taprojapan.co.jp
            </p>
            <p className="text-[11px] font-mono text-[#777777] mt-1">
              Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors inline-flex items-center gap-2 self-start sm:self-center shadow-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Export PDF
          </button>
        </div>

        {/* ── 1. Platform Overview ── */}
        <section className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 shadow-xs">
          <SectionHeader
            number="1"
            title="Platform Overview"
            sub="High-level key performance indicators across all system modules."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <KPI label="Total Auctions"      value={fmt(o.total_auctions)}    sub={`${fmt(o.active_auctions)} active · ${fmt(o.ended_auctions)} ended`} />
            <KPI label="Completed Sales"     value={fmt(o.completed_sales)}   sub={`Completion rate: ${completionRate}`} />
            <KPI label="Total Sales Value"   value={usd(o.total_sales_value)} sub={`Avg: ${usd(o.avg_sale_price)}`} />
            <KPI label="Total Bids Placed"   value={fmt(o.total_bids)}        sub={`Across ${fmt(o.total_auctions)} auctions`} />
            <KPI label="Registered Buyers"   value={fmt(o.total_buyers)}      sub={`${fmt(o.verified_buyers)} verified · ${fmt(o.pending_buyers)} pending`} />
            <KPI label="Vehicle Inventory"   value={fmt(o.total_vehicles)}    sub={`${fmt(o.listed_vehicles)} listed · ${fmt(o.sold_vehicles)} sold`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="border border-[#D8D8D8] rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Metric</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Value</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Auctions — Draft</td><td className="py-2 px-3 font-mono font-bold">{fmt(o.draft_auctions)}</td><td className="py-2 px-3 text-[#555555]">Not yet published</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Auctions — Active</td><td className="py-2 px-3 font-mono font-bold text-emerald-700">{fmt(o.active_auctions)}</td><td className="py-2 px-3 text-[#555555]">Currently accepting bids</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Auctions — Ended</td><td className="py-2 px-3 font-mono font-bold">{fmt(o.ended_auctions)}</td><td className="py-2 px-3 text-[#555555]">Bidding closed</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Auctions — Winner Assigned</td><td className="py-2 px-3 font-mono font-bold text-[#D01F26]">{fmt(o.completed_sales)}</td><td className="py-2 px-3 text-[#555555]">Sale confirmed</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Buyers — Total Registered</td><td className="py-2 px-3 font-mono font-bold">{fmt(o.total_buyers)}</td><td className="py-2 px-3 text-[#555555]">All buyer accounts</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Buyers — Verified</td><td className="py-2 px-3 font-mono font-bold text-emerald-700">{fmt(o.verified_buyers)}</td><td className="py-2 px-3 text-[#555555]">Authorised to bid</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Buyer Verification Rate</td><td className="py-2 px-3 font-mono font-bold">{verificationRate}</td><td className="py-2 px-3 text-[#555555]">Verified / total</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Total Revenue</td><td className="py-2 px-3 font-mono font-bold text-[#1A1A1A]">{usd(o.total_sales_value)}</td><td className="py-2 px-3 text-[#555555]">Sum of winning bids</td></tr>
                  <tr className="hover:bg-[#FAF8F5]"><td className="py-2 px-3 font-medium">Average Sale Price</td><td className="py-2 px-3 font-mono font-bold">{usd(o.avg_sale_price)}</td><td className="py-2 px-3 text-[#555555]">Across closed auctions</td></tr>
                </tbody>
              </table>
            </div>

            <div className="border border-[#D8D8D8] rounded p-4 bg-[#FAF8F5]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">Auction Status Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={[
                      { name: 'Draft', value: Number(o.draft_auctions) },
                      { name: 'Active', value: Number(o.active_auctions) },
                      { name: 'Ended', value: Number(o.ended_auctions) },
                      { name: 'Completed', value: Number(o.completed_sales) }
                    ]}
                    cx="50%" cy="50%" outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    <Cell fill="#9CA3AF" />
                    <Cell fill="#1A1A1A" />
                    <Cell fill="#B45309" />
                    <Cell fill="#D01F26" />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── 2. Auction Performance ── */}
        <section className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 shadow-xs">
          <SectionHeader
            number="2"
            title="Auction Performance Report"
            sub={`Detailed breakdown of all ${auctions.length} auction(s) conducted on the platform.`}
          />

          {auctions.length > 0 && (
            <div className="border border-[#D8D8D8] rounded p-4 bg-[#FAF8F5] mb-6" style={{ height: '320px' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">Winning Amount vs Starting Price</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={auctions.map(a => ({
                  title: a.title?.substring(0, 15) || 'Auction',
                  starting: Number(a.starting_price),
                  winning: Number(a.winning_amount || 0)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="title" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip formatter={(val) => usd(val)} />
                  <Legend />
                  <Bar dataKey="starting" name="Starting Price" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="winning" name="Winning Amount" fill="#D01F26" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="border border-[#D8D8D8] rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">#</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Auction Title</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Vehicle</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Period</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Status</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Starting Price</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Highest Bid</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Winning Bid</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Winner</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Bids</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {auctions.length === 0 && (
                    <tr><td colSpan={10} className="py-6 text-center text-[#777777]">No auctions recorded in system.</td></tr>
                  )}
                  {auctions.map((a, i) => (
                    <tr key={a.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-2 px-3 font-mono text-[#777777]">{i + 1}</td>
                      <td className="py-2 px-3 font-bold text-[#1A1A1A]">{a.title}</td>
                      <td className="py-2 px-3 text-[#555555]">{[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' ') || '—'}</td>
                      <td className="py-2 px-3 text-[#777777] font-mono text-[11px] whitespace-nowrap">
                        {dt(a.starts_at)} → {dt(a.ends_at)}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[#D8D8D8] bg-[#FAF8F5] text-[#1A1A1A]">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#555555]">{usd(a.starting_price)}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#555555]">{a.highest_bid ? usd(a.highest_bid) : '—'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#D01F26]">{a.winning_amount ? usd(a.winning_amount) : '—'}</td>
                      <td className="py-2 px-3 font-semibold text-[#1A1A1A]">{a.winner_name ?? '—'}</td>
                      <td className="py-2 px-3 text-right font-mono">{fmt(a.bid_count)}</td>
                    </tr>
                  ))}
                </tbody>
                {auctions.length > 0 && (
                  <tfoot className="bg-[#FAF8F5] border-t border-[#D8D8D8] font-bold">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-3 text-[#1A1A1A]">Totals</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#1A1A1A]">
                        {usd(auctions.reduce((s, a) => s + Number(a.starting_price ?? 0), 0))}
                      </td>
                      <td />
                      <td className="py-2.5 px-3 text-right font-mono text-[#D01F26]">
                        {usd(auctions.reduce((s, a) => s + Number(a.winning_amount ?? 0), 0))}
                      </td>
                      <td />
                      <td className="py-2.5 px-3 text-right font-mono text-[#1A1A1A]">
                        {fmt(auctions.reduce((s, a) => s + Number(a.bid_count ?? 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </section>

        {/* ── 3. Buyer Activity ── */}
        <section className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 shadow-xs">
          <SectionHeader
            number="3"
            title="Buyer Activity Report"
            sub={`Participation and spending overview for all ${buyers.length} registered buyer(s). Active: ${activeBuyers}.`}
          />

          {buyers.length > 0 && (
            <div className="border border-[#D8D8D8] rounded p-4 bg-[#FAF8F5] mb-6" style={{ height: '320px' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">Top Buyers by Bids Placed</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={[...buyers].sort((a,b) => b.total_bids - a.total_bids).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <RechartsTooltip />
                  <Bar dataKey="total_bids" name="Total Bids" fill="#1A1A1A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="border border-[#D8D8D8] rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">#</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Buyer Name</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Email</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Registered</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Status</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Bids</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Auctions</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Won</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {buyers.length === 0 && (
                    <tr><td colSpan={9} className="py-6 text-center text-[#777777]">No registered buyers.</td></tr>
                  )}
                  {buyers.map((b, i) => (
                    <tr key={b.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-2 px-3 font-mono text-[#777777]">{i + 1}</td>
                      <td className="py-2 px-3 font-bold text-[#1A1A1A]">{b.name}</td>
                      <td className="py-2 px-3 text-[#555555] font-mono text-[11px]">{b.email}</td>
                      <td className="py-2 px-3 text-[#777777] font-mono text-[11px]">{dt(b.created_at)}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[#D8D8D8] bg-[#FAF8F5] text-[#1A1A1A]">
                          {b.verification_status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{fmt(b.total_bids)}</td>
                      <td className="py-2 px-3 text-right font-mono">{fmt(b.auctions_participated)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#D01F26]">{fmt(b.auctions_won)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#1A1A1A]">{Number(b.total_spend) > 0 ? usd(b.total_spend) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 4. Vehicle Inventory ── */}
        <section className="bg-white border border-[#D8D8D8] rounded p-6 sm:p-8 shadow-xs">
          <SectionHeader
            number="4"
            title="Vehicle Inventory Report"
            sub="Breakdown of vehicle stock by make, including status counts and price statistics."
          />

          {inventory.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="border border-[#D8D8D8] rounded p-4 bg-[#FAF8F5]" style={{ height: '300px' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">Inventory Distribution by Make</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={inventory.map(inv => ({ name: inv.make, value: Number(inv.total) }))}
                      cx="50%" cy="50%" outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                    >
                      {inventory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="border border-[#D8D8D8] rounded p-4 bg-[#FAF8F5]" style={{ height: '300px' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">Listed vs Sold by Make</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={inventory.map(inv => ({ name: inv.make, listed: Number(inv.listed_count), sold: Number(inv.sold_count) }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="listed" name="Listed" stackId="a" fill="#1A1A1A" />
                    <Bar dataKey="sold" name="Sold" stackId="a" fill="#D01F26" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="border border-[#D8D8D8] rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777]">Make</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Total</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Draft</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Listed</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Sold</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Avg Price</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Min Price</th>
                    <th className="py-2.5 px-3 font-mono font-bold uppercase tracking-wider text-[#777777] text-right">Max Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {inventory.length === 0 && (
                    <tr><td colSpan={8} className="py-6 text-center text-[#777777]">No vehicles in inventory database.</td></tr>
                  )}
                  {inventory.map((row) => (
                    <tr key={row.make} className="hover:bg-[#FAF8F5]">
                      <td className="py-2 px-3 font-bold text-[#1A1A1A]">{row.make}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{fmt(row.total)}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#555555]">{fmt(row.draft_count)}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#555555]">{fmt(row.listed_count)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{fmt(row.sold_count)}</td>
                      <td className="py-2 px-3 text-right font-mono">{usd(row.avg_starting_price)}</td>
                      <td className="py-2 px-3 text-right font-mono">{usd(row.min_price)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#1A1A1A]">{usd(row.max_price)}</td>
                    </tr>
                  ))}
                </tbody>
                {inventory.length > 0 && (
                  <tfoot className="bg-[#FAF8F5] border-t border-[#D8D8D8] font-bold">
                    <tr>
                      <td className="py-2.5 px-3 text-[#1A1A1A]">All Makes</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#1A1A1A]">{fmt(inventory.reduce((s, r) => s + Number(r.total), 0))}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmt(inventory.reduce((s, r) => s + Number(r.draft_count), 0))}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmt(inventory.reduce((s, r) => s + Number(r.listed_count), 0))}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{fmt(inventory.reduce((s, r) => s + Number(r.sold_count), 0))}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-4 border-t border-[#D8D8D8] text-center text-xs text-[#777777] space-y-1">
          <p>TaproAuto Management Intelligence Report &nbsp;·&nbsp; Tapro Japan Co., Ltd. &nbsp;·&nbsp; Internal Operational Record</p>
          <p className="font-mono text-[11px]">Generated on {new Date().toLocaleString()}</p>
        </footer>
      </div>
    </div>
  )
}

