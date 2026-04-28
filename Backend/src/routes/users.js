import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { verifyUserController } from '../controllers/userController.js';

const router = Router();

// PATCH /users/:id/verify — admin only
// Marks a registered user as verified so they can place bids
router.patch('/:id/verify', authRequired, requireRole(['admin']), verifyUserController);

export default router;
