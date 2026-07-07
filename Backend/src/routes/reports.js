import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { getSummaryReport } from '../controllers/reportController.js';

const router = Router();

// Admin-only: full management report
router.get('/summary', authRequired, requireRole(['admin']), getSummaryReport);

export default router;
