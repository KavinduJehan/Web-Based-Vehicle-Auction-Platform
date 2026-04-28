import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import {
  listAuctionsController,
  getAuctionController,
  createAuctionController,
  updateAuctionController,
  deleteAuctionController,
  selectWinnerController,
  closeAuctionController,
  getWinnerController
} from '../controllers/auctionController.js';
import bidRoutes from './bids.js';

const router = Router();

const auctionCreateSchema = Joi.object({
  vehicleId:    Joi.number().integer().positive().required(),
  title:        Joi.string().min(1).optional(),
  description:  Joi.string().allow('').optional(),
  status:       Joi.string().valid('draft', 'active').optional(),
  startsAt:     Joi.date().iso().optional().allow(null),
  endsAt:       Joi.date().iso().optional().allow(null),
  minIncrement: Joi.number().min(0).default(0),
});

const auctionUpdateSchema = Joi.object({
  title:        Joi.string().min(1).optional(),
  description:  Joi.string().allow('').optional(),
  status:       Joi.string().valid('draft', 'active', 'ended').optional(),
  startsAt:     Joi.date().iso().optional().allow(null),
  endsAt:       Joi.date().iso().optional().allow(null),
  minIncrement: Joi.number().min(0).optional(),
});

const winnerSchema = Joi.object({
  bidId: Joi.number().integer().positive().required()
});

router.get('/', listAuctionsController);
router.get('/:id', getAuctionController);
router.post('/', authRequired, requireRole(['admin']), validate(auctionCreateSchema), createAuctionController);
router.put('/:id', authRequired, requireRole(['admin']), validate(auctionUpdateSchema), updateAuctionController);
router.delete('/:id', authRequired, requireRole(['admin']), deleteAuctionController);
router.post('/:id/winner', authRequired, requireRole(['admin']), validate(winnerSchema), selectWinnerController);
router.post('/:id/close', authRequired, requireRole(['admin']), closeAuctionController);
router.get('/:id/winner', getWinnerController);

// Nested: GET|POST /auctions/:auctionId/bids
router.use('/:auctionId/bids', bidRoutes);

export default router;
