import { Router } from 'express';
import Joi from 'joi';
import { validate, validateQuery } from '../middleware/validate.js';
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
  title:         Joi.string().min(1).required(),
  description:   Joi.string().allow('').required(),
  startingPrice: Joi.number().positive().required(),
  make:          Joi.string().allow('').required(),
  model:         Joi.string().allow('').required(),
  year:          Joi.number().integer().min(1900).max(2100).required(),
  status:        Joi.string().valid('draft', 'listed', 'sold').required(),
  chassisNumber: Joi.string().max(100).optional().allow(null, ''),
  mileage:       Joi.number().integer().min(0).optional().allow(null),
  grade:         Joi.string().max(20).optional().allow(null, ''),
  images:        Joi.array().items(Joi.string()).optional(),
});

const listQuerySchema = Joi.object({
  status:   Joi.string().valid('draft', 'listed', 'sold').optional(),
  make:     Joi.string().max(100).optional(),
  model:    Joi.string().max(100).optional(),
  yearMin:  Joi.number().integer().min(1900).max(2100).optional(),
  yearMax:  Joi.number().integer().min(1900).max(2100).optional(),
  priceMin: Joi.number().min(0).optional(),
  priceMax: Joi.number().min(0).optional(),
  search:   Joi.string().max(200).optional(),
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  sortBy:   Joi.string().valid('created_at', 'starting_price', 'year', 'title').default('created_at'),
  order:    Joi.string().valid('asc', 'desc').default('desc'),
});

router.get('/', validateQuery(listQuerySchema), listVehiclesController);
router.get('/:id', getVehicleController);
router.post('/', authRequired, requireRole(['admin']), validate(vehicleSchema), createVehicleController);
router.put('/:id', authRequired, requireRole(['admin']), validate(vehicleSchema), updateVehicleController);
router.delete('/:id', authRequired, requireRole(['admin']), deleteVehicleController);

export default router;
