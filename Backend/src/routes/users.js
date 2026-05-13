import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { listUsersController, getMeController, setUserStatusController, changePasswordController } from '../controllers/userController.js';

const router = Router();

const statusSchema = Joi.object({
  status: Joi.string().valid('verified', 'rejected').required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// GET /users — admin only: list all users
router.get('/', authRequired, requireRole(['admin']), listUsersController);

// GET /users/me — any authenticated user fetches their own profile
router.get('/me', authRequired, getMeController);

// PATCH /users/me/password — change own password (clears must_change_password flag)
router.patch('/me/password', authRequired, validate(changePasswordSchema), changePasswordController);

// PATCH /users/:id/status — admin only: verify or reject a user
router.patch('/:id/status', authRequired, requireRole(['admin']), validate(statusSchema), setUserStatusController);

export default router;
