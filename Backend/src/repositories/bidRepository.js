import { pool } from '../db/pool.js';

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM bids WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

export async function findByAuction(auctionId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE auction_id = $1 ORDER BY amount DESC',
    [auctionId]
  );
  return rows;
}

export async function findByAuctionAndUser(auctionId, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE auction_id = $1 AND user_id = $2 ORDER BY amount DESC',
    [auctionId, userId]
  );
  return rows;
}

export async function findHighestBid(auctionId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE auction_id = $1 ORDER BY amount DESC LIMIT 1',
    [auctionId]
  );
  return rows[0];
}

export async function create({ auctionId, userId, amount }) {
  const { rows } = await pool.query(
    `INSERT INTO bids (auction_id, user_id, amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [auctionId, userId, amount]
  );
  return rows[0];
}
