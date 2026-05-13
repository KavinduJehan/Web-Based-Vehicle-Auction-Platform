/**
 * One-time admin bootstrap script.
 *
 * Creates the initial admin accounts for the two business owners.
 * Run once during deployment (or after running migrations):
 *
 *   node scripts/seed-admins.js
 *
 * Requires DATABASE_URL and BCRYPT_ROUNDS to be set (via .env or environment).
 * Safe to re-run: skips accounts whose email already exists.
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';

dotenv.config();

const ADMINS = [
  // Replace these with the real names, emails, and temporary passwords.
  // Passwords should be changed on first login.
  { name: 'Owner',    email: 'owner@thaproauto.com', password: 'ChangeMe1!' },
  { name: 'Owner Two', email: 'owner2@thaproauto.com', password: 'ChangeMe2!' },
];

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    for (const admin of ADMINS) {
      const { rows } = await pool.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [admin.email]
      );

      if (rows.length > 0) {
        console.log(`[SKIP]   ${admin.email} already exists`);
        continue;
      }

      const passwordHash = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);

      await pool.query(
        `INSERT INTO users (email, password_hash, role, name, verification_status, must_change_password)
         VALUES ($1, $2, 'admin', $3, 'verified', true)`,
        [admin.email, passwordHash, admin.name]
      );

      console.log(`[CREATED] ${admin.email} (admin)`);
    }
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
