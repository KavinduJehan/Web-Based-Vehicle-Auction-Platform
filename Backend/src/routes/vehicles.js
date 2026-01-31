import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import {
  createVehicleController,
  listVehiclesController,
  getVehicleController,
  updateVehicleController,
  deleteVehicleController
} from '../controllers/vehicleController.js';

const router = Router();

const vehicleSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('').required(),
  startingPrice: Joi.number().positive().required(),
  make: Joi.string().allow('').required(),
  model: Joi.string().allow('').required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  status: Joi.string().valid('draft', 'listed', 'sold').required()
});

router.get('/', listVehiclesController);
router.get('/:id', getVehicleController);
router.post('/', authRequired, requireRole(['admin', 'seller']), validate(vehicleSchema), createVehicleController);
router.put('/:id', authRequired, requireRole(['admin', 'seller']), validate(vehicleSchema), updateVehicleController);
router.delete('/:id', authRequired, requireRole(['admin']), deleteVehicleController);

export default router;
