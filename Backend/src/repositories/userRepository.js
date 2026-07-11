import { pool } from '../db/pool.js';

export async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

export async function create({ email, passwordHash, role, name }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, role, name, verification_status`,
    [email, passwordHash, role, name]
  );
  return rows[0];
}

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, email, role, name, verification_status, created_at FROM users ORDER BY created_at DESC`
  );
  return rows;
}

export async function setStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE users SET verification_status = $1 WHERE id = $2
     RETURNING id, email, role, name, verification_status`,
    [status, id]
  );
  return rows[0];
}

export async function changePassword(id, passwordHash) {
  const { rows } = await pool.query(
    `UPDATE users
     SET password_hash = $1, must_change_password = false
     WHERE id = $2
     RETURNING id, email, role, name, verification_status, must_change_password`,
    [passwordHash, id]
  );
  return rows[0];
}

export async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );

  const { rows } = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

export async function resetPasswordWithToken({ tokenHash, passwordHash }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );

    const token = rows[0];
    if (!token) {
      await client.query('ROLLBACK');
      return null;
    }

    const updated = await client.query(
      `UPDATE users
       SET password_hash = $1, must_change_password = false
       WHERE id = $2
       RETURNING id, email, role, name, verification_status, must_change_password`,
      [passwordHash, token.user_id]
    );

    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [token.id]
    );

    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [token.user_id]
    );

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
