import cron from 'node-cron';
import { pool } from './db/pool.js';

/**
 * Runs every minute.
 * Advances auction statuses based on starts_at / ends_at:
 *   draft  + starts_at <= NOW  →  active
 *   active + ends_at   <= NOW  →  ended
 *
 * Only touches rows that genuinely need changing, so it is safe to run
 * frequently and won't interfere with manually-set statuses.
 */
function startScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date().toISOString();
    try {
      // draft → active
      await pool.query(
        `UPDATE auctions
         SET status = 'active'
         WHERE status = 'draft'
           AND starts_at IS NOT NULL
           AND starts_at <= $1`,
        [now]
      );

      // active → ended
      await pool.query(
        `UPDATE auctions
         SET status = 'ended'
         WHERE status = 'active'
           AND ends_at IS NOT NULL
           AND ends_at <= $1`,
        [now]
      );
    } catch (err) {
      console.error('[scheduler] status transition error:', err.message);
    }
  });

  console.log('[scheduler] auction status cron started (every minute)');
}

export default startScheduler;
