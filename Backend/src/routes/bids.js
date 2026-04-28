import { Router } from 'express';
import Joi from 'joi';
import { authRequired, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { placeBidController, listBidsForAuctionController } from '../controllers/bidController.js';

// mergeParams lets this router see :auctionId from the parent auctions router
const router = Router({ mergeParams: true });

const bidSchema = Joi.object({
  amount: Joi.number().positive().required()
});

router.get('/', authRequired, listBidsForAuctionController);
router.post('/', authRequired, requireRole(['buyer']), validate(bidSchema), placeBidController);

export default router;
