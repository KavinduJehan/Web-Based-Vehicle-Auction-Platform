import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { getMeController, setUserStatusController } from '../controllers/userController.js';

const router = Router();

const statusSchema = Joi.object({
  status: Joi.string().valid('verified', 'rejected').required()
});

// GET /users/me — any authenticated user fetches their own profile
router.get('/me', authRequired, getMeController);

// PATCH /users/:id/status — admin only: verify or reject a user
router.patch('/:id/status', authRequired, requireRole(['admin']), validate(statusSchema), setUserStatusController);

export default router;
