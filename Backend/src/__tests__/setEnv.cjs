/**
 * Runs before any test module is loaded (Jest setupFiles).
 * Loads .env.test and hard-fails if DATABASE_URL is not set —
 * this prevents tests from accidentally hitting the dev database.
 */
const path = require('path');

// Load .env.test (won't override vars already in process.env)
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

if (!process.env.DATABASE_URL) {
  throw new Error(
    '\n\n' +
    '  Tests require a DATABASE_URL pointing at a TEST database.\n' +
    '  Create Backend/.env.test with:\n\n' +
    '    DATABASE_URL=postgres://postgres:<password>@localhost:5432/vehicle_auction_test\n' +
    '    JWT_SECRET=test-secret\n\n' +
    '  Then create the test DB and apply the migration:\n' +
    '    psql -U postgres -c "CREATE DATABASE vehicle_auction_test;"\n' +
    '    psql -U postgres -d vehicle_auction_test -f migrations/001_initial_schema.sql\n'
  );
}

// Test-specific overrides — always applied regardless of .env.test contents
process.env.BCRYPT_ROUNDS = '1'; // fast hashing in tests
process.env.NODE_ENV = 'test';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';
