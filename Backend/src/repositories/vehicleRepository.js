import { pool } from '../db/pool.js';

export async function findAll() {
  const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

export async function create(payload) {
  const { rows } = await pool.query(
    `INSERT INTO vehicles (title, description, starting_price, make, model, year, status, seller_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.title,
      payload.description,
      payload.startingPrice,
      payload.make,
      payload.model,
      payload.year,
      payload.status,
      payload.sellerId
    ]
  );
  return rows[0];
}

export async function update(id, payload) {
  const { rows } = await pool.query(
    `UPDATE vehicles
     SET title = $1, description = $2, starting_price = $3, make = $4, model = $5, year = $6, status = $7
     WHERE id = $8
     RETURNING *`,
    [
      payload.title,
      payload.description,
      payload.startingPrice,
      payload.make,
      payload.model,
      payload.year,
      payload.status,
      id
    ]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return rowCount > 0;
}
