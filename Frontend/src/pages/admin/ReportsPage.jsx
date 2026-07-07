import { useEffect, useState } from 'react'
import { getSummaryReport } from '../../api/reports'
import Spinner from '../../components/Spinner'

const fmt = (n) => Number(n ?? 0).toLocaleString()
const usd = (n) => `USD ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pct = (a, b) => b > 0 ? `${Math.round((a / b) * 100)}%` : '—'
const dt  = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function KPI({ label, value, sub }) {
  return (
    <div className="report-kpi">
      <p className="report-kpi-label">{label}</p>
      <p className="report-kpi-value">{value}</p>
      {sub && <p className="report-kpi-sub">{sub}</p>}
    </div>
  )
}

function SectionHeader({ number, title, sub }) {
  return (
    <div className="report-section-header">
      <span className="report-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
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

  if (loading) return <Spinner />
  if (error)   return <div className="page"><div className="report-error">{error}</div></div>

  const { overview: o, auctions, buyers, inventory } = data

  const completionRate  = pct(Number(o.completed_sales), Number(o.ended_auctions))
  const verificationRate = pct(Number(o.verified_buyers), Number(o.total_buyers))
  const activeBuyers    = buyers.filter(b => Number(b.total_bids) > 0).length

  return (
    <div className="report-page">

      {/* ── Cover ── */}
      <div className="report-cover no-print-break">
        <div className="report-cover-inner">
          <p className="eyebrow">Taproauto · Management Report</p>
          <h1>Operational Summary Report</h1>
          <p className="report-cover-sub">
            Tapro Japan Co., Ltd. &nbsp;·&nbsp; 1-1-14 Kamiikedai, Ota-ku, Tokyo 145-0064 &nbsp;·&nbsp; info@taprojapan.co.jp
          </p>
          <p className="report-cover-date">Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary report-print-btn no-print"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Export PDF
        </button>
      </div>

      {/* ── 1. Platform Overview ── */}
      <section className="report-section">
        <SectionHeader
          number="1"
          title="Platform Overview"
          sub="High-level key performance indicators across all system modules."
        />

        <div className="report-kpi-grid">
          <KPI label="Total Auctions"      value={fmt(o.total_auctions)}    sub={`${fmt(o.active_auctions)} active · ${fmt(o.ended_auctions)} ended`} />
          <KPI label="Completed Sales"     value={fmt(o.completed_sales)}   sub={`Completion rate: ${completionRate}`} />
          <KPI label="Total Sales Value"   value={usd(o.total_sales_value)} sub={`Avg: ${usd(o.avg_sale_price)}`} />
          <KPI label="Total Bids"          value={fmt(o.total_bids)}        sub={`Across ${fmt(o.total_auctions)} auctions`} />
          <KPI label="Registered Buyers"   value={fmt(o.total_buyers)}      sub={`${fmt(o.verified_buyers)} verified · ${fmt(o.pending_buyers)} pending`} />
          <KPI label="Vehicle Inventory"   value={fmt(o.total_vehicles)}    sub={`${fmt(o.listed_vehicles)} listed · ${fmt(o.sold_vehicles)} sold`} />
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Count / Value</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Auctions — Draft</td>        <td>{fmt(o.draft_auctions)}</td>    <td>Not yet published</td></tr>
            <tr><td>Auctions — Active</td>       <td>{fmt(o.active_auctions)}</td>   <td>Currently accepting bids</td></tr>
            <tr><td>Auctions — Ended</td>        <td>{fmt(o.ended_auctions)}</td>    <td>Bidding closed</td></tr>
            <tr><td>Auctions — Winner Assigned</td><td>{fmt(o.completed_sales)}</td> <td>Sale confirmed</td></tr>
            <tr><td>Buyers — Total Registered</td><td>{fmt(o.total_buyers)}</td>     <td>All buyer accounts</td></tr>
            <tr><td>Buyers — Verified</td>       <td>{fmt(o.verified_buyers)}</td>   <td>Authorised to bid</td></tr>
            <tr><td>Buyers — Pending Approval</td><td>{fmt(o.pending_buyers)}</td>   <td>Awaiting admin review</td></tr>
            <tr><td>Buyer Verification Rate</td> <td>{verificationRate}</td>          <td>Verified / total buyers</td></tr>
            <tr><td>Total Bids Placed</td>       <td>{fmt(o.total_bids)}</td>        <td>All bids across all auctions</td></tr>
            <tr><td>Total Sales Revenue</td>     <td>{usd(o.total_sales_value)}</td> <td>Sum of winning bids</td></tr>
            <tr><td>Average Sale Price</td>      <td>{usd(o.avg_sale_price)}</td>    <td>Across completed auctions</td></tr>
          </tbody>
        </table>
      </section>

      {/* ── 2. Auction Performance ── */}
      <section className="report-section">
        <SectionHeader
          number="2"
          title="Auction Performance Report"
          sub={`Detailed breakdown of all ${auctions.length} auction(s) conducted on the platform.`}
        />

        <table className="report-table report-table--wide">
          <thead>
            <tr>
              <th>#</th>
              <th>Auction Title</th>
              <th>Vehicle</th>
              <th>Period</th>
              <th>Status</th>
              <th className="text-right">Starting Price</th>
              <th className="text-right">Highest Bid</th>
              <th className="text-right">Winning Bid</th>
              <th>Winner</th>
              <th className="text-right">Bids</th>
              <th>Reserve</th>
            </tr>
          </thead>
          <tbody>
            {auctions.length === 0 && (
              <tr><td colSpan={11} className="report-empty">No auctions recorded.</td></tr>
            )}
            {auctions.map((a, i) => (
              <tr key={a.id}>
                <td className="report-muted">{i + 1}</td>
                <td className="report-bold">{a.title}</td>
                <td>{[a.vehicle_make, a.vehicle_model, a.vehicle_year].filter(Boolean).join(' ') || '—'}</td>
                <td className="report-muted" style={{ whiteSpace: 'nowrap' }}>
                  {dt(a.starts_at)}<br />{dt(a.ends_at)}
                </td>
                <td><span className={`report-badge report-badge--${a.status}`}>{a.status}</span></td>
                <td className="text-right">{usd(a.starting_price)}</td>
                <td className="text-right">{a.highest_bid ? usd(a.highest_bid) : '—'}</td>
                <td className="text-right report-bold">{a.winning_amount ? usd(a.winning_amount) : '—'}</td>
                <td>{a.winner_name ?? '—'}</td>
                <td className="text-right">{fmt(a.bid_count)}</td>
                <td>
                  {a.reserve_met === null ? '—'
                    : a.reserve_met ? <span className="report-badge report-badge--met">Met</span>
                    : <span className="report-badge report-badge--unmet">Not met</span>}
                </td>
              </tr>
            ))}
          </tbody>
          {auctions.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} className="report-bold">Totals</td>
                <td className="text-right report-bold">
                  {usd(auctions.reduce((s, a) => s + Number(a.starting_price ?? 0), 0))}
                </td>
                <td />
                <td className="text-right report-bold">
                  {usd(auctions.reduce((s, a) => s + Number(a.winning_amount ?? 0), 0))}
                </td>
                <td />
                <td className="text-right report-bold">
                  {fmt(auctions.reduce((s, a) => s + Number(a.bid_count ?? 0), 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </section>

      {/* ── 3. Buyer Activity ── */}
      <section className="report-section">
        <SectionHeader
          number="3"
          title="Buyer Activity Report"
          sub={`Participation and spending overview for all ${buyers.length} registered buyer(s). Active: ${activeBuyers}.`}
        />

        <table className="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Buyer Name</th>
              <th>Email</th>
              <th>Registered</th>
              <th>Status</th>
              <th className="text-right">Bids Placed</th>
              <th className="text-right">Auctions Entered</th>
              <th className="text-right">Auctions Won</th>
              <th className="text-right">Total Spend</th>
              <th className="text-right">Highest Bid</th>
            </tr>
          </thead>
          <tbody>
            {buyers.length === 0 && (
              <tr><td colSpan={10} className="report-empty">No buyers registered.</td></tr>
            )}
            {buyers.map((b, i) => (
              <tr key={b.id}>
                <td className="report-muted">{i + 1}</td>
                <td className="report-bold">{b.name}</td>
                <td className="report-muted">{b.email}</td>
                <td className="report-muted">{dt(b.created_at)}</td>
                <td><span className={`report-badge report-badge--${b.verification_status}`}>{b.verification_status}</span></td>
                <td className="text-right">{fmt(b.total_bids)}</td>
                <td className="text-right">{fmt(b.auctions_participated)}</td>
                <td className="text-right report-bold">{fmt(b.auctions_won)}</td>
                <td className="text-right">{Number(b.total_spend) > 0 ? usd(b.total_spend) : '—'}</td>
                <td className="text-right">{Number(b.highest_bid_placed) > 0 ? usd(b.highest_bid_placed) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── 4. Vehicle Inventory ── */}
      <section className="report-section">
        <SectionHeader
          number="4"
          title="Vehicle Inventory Report"
          sub="Breakdown of vehicle stock by make, including status counts and price statistics."
        />

        <table className="report-table">
          <thead>
            <tr>
              <th>Make</th>
              <th className="text-right">Total</th>
              <th className="text-right">Draft</th>
              <th className="text-right">Listed</th>
              <th className="text-right">Sold</th>
              <th className="text-right">Avg Starting Price</th>
              <th className="text-right">Min Price</th>
              <th className="text-right">Max Price</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr><td colSpan={8} className="report-empty">No vehicles in inventory.</td></tr>
            )}
            {inventory.map((row) => (
              <tr key={row.make}>
                <td className="report-bold">{row.make}</td>
                <td className="text-right">{fmt(row.total)}</td>
                <td className="text-right">{fmt(row.draft_count)}</td>
                <td className="text-right">{fmt(row.listed_count)}</td>
                <td className="text-right">{fmt(row.sold_count)}</td>
                <td className="text-right">{usd(row.avg_starting_price)}</td>
                <td className="text-right">{usd(row.min_price)}</td>
                <td className="text-right">{usd(row.max_price)}</td>
              </tr>
            ))}
          </tbody>
          {inventory.length > 0 && (
            <tfoot>
              <tr>
                <td className="report-bold">All Makes</td>
                <td className="text-right report-bold">{fmt(inventory.reduce((s, r) => s + Number(r.total), 0))}</td>
                <td className="text-right">{fmt(inventory.reduce((s, r) => s + Number(r.draft_count), 0))}</td>
                <td className="text-right">{fmt(inventory.reduce((s, r) => s + Number(r.listed_count), 0))}</td>
                <td className="text-right">{fmt(inventory.reduce((s, r) => s + Number(r.sold_count), 0))}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </section>

      {/* ── Footer ── */}
      <footer className="report-footer">
        <p>Taproauto Management Report &nbsp;·&nbsp; Tapro Japan Co., Ltd. &nbsp;·&nbsp; Confidential</p>
        <p>Generated {new Date().toLocaleString()}</p>
      </footer>
    </div>
  )
}
