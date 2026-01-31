import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { registerController, loginController } from '../controllers/authController.js';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'seller', 'buyer').required(),
  name: Joi.string().min(1).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);

export default router;
