import { pool } from '../db/pool.js';

export async function findByVehicle(vehicleId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE vehicle_id = $1 ORDER BY amount DESC',
    [vehicleId]
  );
  return rows;
}

export async function findByVehicleAndUser(vehicleId, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE vehicle_id = $1 AND user_id = $2 ORDER BY amount DESC',
    [vehicleId, userId]
  );
  return rows;
}

export async function findHighestBid(vehicleId) {
  const { rows } = await pool.query(
    'SELECT * FROM bids WHERE vehicle_id = $1 ORDER BY amount DESC LIMIT 1',
    [vehicleId]
  );
  return rows[0];
}

export async function create({ vehicleId, userId, amount }) {
  const { rows } = await pool.query(
    `INSERT INTO bids (vehicle_id, user_id, amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [vehicleId, userId, amount]
  );
  return rows[0];
}
