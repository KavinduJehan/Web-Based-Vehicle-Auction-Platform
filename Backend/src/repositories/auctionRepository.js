import { pool } from '../db/pool.js';

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM auctions WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

export async function findAll() {
  const { rows } = await pool.query('SELECT * FROM auctions ORDER BY created_at DESC');
  return rows;
}

export async function create(payload) {
  const { rows } = await pool.query(
    `INSERT INTO auctions (vehicle_id, title, description, status, starts_at, ends_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      payload.vehicleId,
      payload.title,
      payload.description,
      payload.status,
      payload.startsAt,
      payload.endsAt
    ]
  );
  return rows[0];
}

export async function update(id, payload) {
  const { rows } = await pool.query(
    `UPDATE auctions
     SET title = $1, description = $2, status = $3, starts_at = $4, ends_at = $5
     WHERE id = $6
     RETURNING *`,
    [payload.title, payload.description, payload.status, payload.startsAt, payload.endsAt, id]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM auctions WHERE id = $1', [id]);
  return rowCount > 0;
}
