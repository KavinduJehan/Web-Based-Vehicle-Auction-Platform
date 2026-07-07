import { pool } from '../db/pool.js';

/** Platform-wide KPI counters */
export async function getOverview() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)  FROM vehicles)                                          AS total_vehicles,
      (SELECT COUNT(*)  FROM vehicles  WHERE status = 'listed')                AS listed_vehicles,
      (SELECT COUNT(*)  FROM vehicles  WHERE status = 'sold')                  AS sold_vehicles,
      (SELECT COUNT(*)  FROM auctions)                                         AS total_auctions,
      (SELECT COUNT(*)  FROM auctions  WHERE status = 'active')                AS active_auctions,
      (SELECT COUNT(*)  FROM auctions  WHERE status = 'ended')                 AS ended_auctions,
      (SELECT COUNT(*)  FROM auctions  WHERE status = 'draft')                 AS draft_auctions,
      (SELECT COUNT(*)  FROM auctions  WHERE winning_bid_id IS NOT NULL)       AS completed_sales,
      (SELECT COUNT(*)  FROM users     WHERE role = 'buyer')                   AS total_buyers,
      (SELECT COUNT(*)  FROM users     WHERE role = 'buyer'
                                        AND verification_status = 'verified')  AS verified_buyers,
      (SELECT COUNT(*)  FROM users     WHERE role = 'buyer'
                                        AND verification_status = 'pending')   AS pending_buyers,
      (SELECT COUNT(*)  FROM bids)                                             AS total_bids,
      (SELECT COALESCE(SUM(b.amount), 0)
         FROM bids b
         JOIN auctions a ON a.winning_bid_id = b.id)                          AS total_sales_value,
      (SELECT COALESCE(AVG(b.amount), 0)
         FROM bids b
         JOIN auctions a ON a.winning_bid_id = b.id)                          AS avg_sale_price
  `);
  return rows[0];
}

/** Full auction performance table */
export async function getAuctionReport() {
  const { rows } = await pool.query(`
    SELECT
      a.id,
      a.title,
      a.status,
      a.starts_at,
      a.ends_at,
      a.created_at,
      v.make            AS vehicle_make,
      v.model           AS vehicle_model,
      v.year            AS vehicle_year,
      v.starting_price,
      a.min_increment,
      a.reserve_price,
      COUNT(b.id)                                    AS bid_count,
      MAX(b.amount)                                  AS highest_bid,
      wb.amount                                      AS winning_amount,
      wu.name                                        AS winner_name,
      CASE
        WHEN a.reserve_price IS NULL THEN NULL
        WHEN MAX(b.amount) >= a.reserve_price THEN true
        ELSE false
      END                                            AS reserve_met
    FROM auctions a
    LEFT JOIN vehicles  v  ON v.id  = a.vehicle_id
    LEFT JOIN bids      b  ON b.auction_id = a.id
    LEFT JOIN bids      wb ON wb.id = a.winning_bid_id
    LEFT JOIN users     wu ON wu.id = wb.user_id
    GROUP BY a.id, v.make, v.model, v.year, v.starting_price, wb.amount, wu.name
    ORDER BY a.created_at DESC
  `);
  return rows;
}

/** Buyer activity — top bidders with win/participation stats */
export async function getBuyerReport() {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.verification_status,
      u.created_at,
      COUNT(DISTINCT b.id)                                  AS total_bids,
      COUNT(DISTINCT b.auction_id)                          AS auctions_participated,
      COUNT(DISTINCT CASE WHEN a.winning_bid_id = b.id
                          THEN a.id END)                    AS auctions_won,
      COALESCE(MAX(b.amount), 0)                            AS highest_bid_placed,
      COALESCE(SUM(CASE WHEN a.winning_bid_id = b.id
                        THEN b.amount END), 0)              AS total_spend
    FROM users u
    LEFT JOIN bids     b ON b.user_id = u.id
    LEFT JOIN auctions a ON a.id = b.auction_id
    WHERE u.role = 'buyer'
    GROUP BY u.id, u.name, u.email, u.verification_status, u.created_at
    ORDER BY total_bids DESC
  `);
  return rows;
}

/** Vehicle inventory breakdown by make */
export async function getInventoryReport() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(make, 'Unknown')           AS make,
      COUNT(*)                            AS total,
      COUNT(CASE WHEN status = 'draft'   THEN 1 END) AS draft_count,
      COUNT(CASE WHEN status = 'listed'  THEN 1 END) AS listed_count,
      COUNT(CASE WHEN status = 'sold'    THEN 1 END) AS sold_count,
      ROUND(AVG(starting_price)::numeric, 2)         AS avg_starting_price,
      MIN(starting_price)                             AS min_price,
      MAX(starting_price)                             AS max_price
    FROM vehicles
    GROUP BY make
    ORDER BY total DESC
  `);
  return rows;
}
