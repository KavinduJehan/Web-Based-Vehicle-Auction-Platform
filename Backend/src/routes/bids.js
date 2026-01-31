import { Router } from 'express';
import Joi from 'joi';
import { authRequired, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { placeBidController, listBidsForVehicleController } from '../controllers/bidController.js';

const router = Router();

const bidSchema = Joi.object({
  amount: Joi.number().positive().required()
});

router.get('/vehicle/:vehicleId', authRequired, listBidsForVehicleController);
router.post('/vehicle/:vehicleId', authRequired, requireRole(['buyer']), validate(bidSchema), placeBidController);

export default router;
