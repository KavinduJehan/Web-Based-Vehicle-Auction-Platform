import { pool } from '../db/pool.js';

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM auctions WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

// Additional queries (create/update/list) will be added when auction logic is implemented.
