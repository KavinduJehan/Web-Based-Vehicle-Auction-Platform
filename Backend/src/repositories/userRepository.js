import { pool } from '../db/pool.js';

export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0];
}

export async function create({ email, passwordHash, role, name, isVerified }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name, is_verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, name, is_verified`,
    [email, passwordHash, role, name, isVerified]
  );
  return rows[0];
}
