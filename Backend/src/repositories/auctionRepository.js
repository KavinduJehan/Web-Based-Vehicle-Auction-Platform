import { pool } from '../db/pool.js';

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT a.*,
            v.images          AS vehicle_images,
            v.make            AS vehicle_make,
            v.model           AS vehicle_model,
            v.year            AS vehicle_year,
            v.starting_price  AS starting_price,
            (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) AS highest_bid
     FROM auctions a
     LEFT JOIN vehicles v ON v.id = a.vehicle_id
     WHERE a.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0];
}

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT a.*,
            v.images         AS vehicle_images,
            v.make           AS vehicle_make,
            v.model          AS vehicle_model,
            v.year           AS vehicle_year,
            v.starting_price AS starting_price,
            (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) AS highest_bid
     FROM auctions a
     LEFT JOIN vehicles v ON v.id = a.vehicle_id
     ORDER BY a.created_at DESC`
  );
  return rows;
}

export async function create(payload) {
  const { rows } = await pool.query(
    `INSERT INTO auctions (vehicle_id, title, description, status, starts_at, ends_at, min_increment, reserve_price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.vehicleId,
      payload.title,
      payload.description,
      payload.status,
      payload.startsAt,
      payload.endsAt,
      payload.minIncrement ?? 0,
      payload.reservePrice ?? null,
    ]
  );
  return rows[0];
}

export async function update(id, payload) {
  const { rows } = await pool.query(
    `UPDATE auctions
     SET title = $1, description = $2, status = $3, starts_at = $4, ends_at = $5, min_increment = $6, reserve_price = $7
     WHERE id = $8
     RETURNING *`,
    [payload.title, payload.description, payload.status, payload.startsAt, payload.endsAt, payload.minIncrement, payload.reservePrice, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM auctions WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function setWinner(id, winningBidId) {
  const { rows } = await pool.query(
    `UPDATE auctions SET winning_bid_id = $1, status = 'ended' WHERE id = $2 RETURNING *`,
    [winningBidId, id]
  );
  return rows[0];
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE auctions SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
}

export async function findWinner(id) {
  const { rows } = await pool.query(
    `SELECT
       a.*,
       b.id          AS bid_id,
       b.amount      AS bid_amount,
       b.created_at  AS bid_placed_at,
       u.id          AS winner_id,
       u.name        AS winner_name,
       u.email       AS winner_email
     FROM auctions a
     JOIN bids  b ON a.winning_bid_id = b.id
     JOIN users u ON b.user_id = u.id
     WHERE a.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findWonByUser(userId) {
  const { rows } = await pool.query(
    `SELECT a.*,
            v.images          AS vehicle_images,
            v.make            AS vehicle_make,
            v.model           AS vehicle_model,
            v.year            AS vehicle_year,
            v.starting_price  AS starting_price,
            b.amount          AS winning_amount
     FROM auctions a
     JOIN bids b ON b.id = a.winning_bid_id
     LEFT JOIN vehicles v ON v.id = a.vehicle_id
     WHERE b.user_id = $1
     ORDER BY a.ends_at DESC`,
    [userId]
  );
  return rows;
}
