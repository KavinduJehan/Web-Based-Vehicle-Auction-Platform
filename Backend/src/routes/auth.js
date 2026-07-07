import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import { registerController, loginController, logoutController, meController } from '../controllers/authController.js';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('buyer').required(),
  name: Joi.string().min(1).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', logoutController);
router.get('/me', authRequired, meController);

export default router;
