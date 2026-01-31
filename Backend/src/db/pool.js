import pg from 'pg';
import config from '../config/index.js';

const { Pool } = pg;

// Single shared pool for the process
export const pool = new Pool({
  connectionString: config.databaseUrl
});

pool.on('error', (err) => {
  // Fatal connection errors should be surfaced during dev
  console.error('Unexpected PG error', err);
  process.exit(1);
});
