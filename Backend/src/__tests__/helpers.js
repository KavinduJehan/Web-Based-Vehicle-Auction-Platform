import { pool } from '../db/pool.js';
import app from '../app.js';
import bcrypt from 'bcrypt';
import request from 'supertest';

export { app, pool };

/** Wipe all rows and reset auto-increment sequences between test suites. */
export async function truncateAll() {
  await pool.query(
    'TRUNCATE TABLE bids, auctions, vehicles, users RESTART IDENTITY CASCADE'
  );
}

/** Insert an admin user directly into the DB (bypasses public registration). */
export async function createAdmin(opts = {}) {
  const email    = opts.email    ?? 'admin@test.com';
  const password = opts.password ?? 'AdminPass1!';
  const hash = await bcrypt.hash(password, 1);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name, is_verified)
     VALUES ($1, $2, 'admin', $3, true)
     RETURNING id, email, role, name, is_verified`,
    [email, hash, opts.name ?? 'Test Admin']
  );
  return { ...rows[0], password };
}

/** Insert a buyer directly into the DB. */
export async function createBuyer(opts = {}) {
  const email      = opts.email      ?? 'buyer@test.com';
  const password   = opts.password   ?? 'BuyerPass1!';
  const isVerified = opts.isVerified ?? false;
  const hash = await bcrypt.hash(password, 1);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name, is_verified)
     VALUES ($1, $2, 'buyer', $3, $4)
     RETURNING id, email, role, name, is_verified`,
    [email, hash, opts.name ?? 'Test Buyer', isVerified]
  );
  return { ...rows[0], password };
}

/** Log in via the API and return the JWT string. */
export async function loginAs(user) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.token;
}
