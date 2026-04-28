import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import {
  listAuctionsController,
  getAuctionController,
  createAuctionController,
  updateAuctionController,
  deleteAuctionController
} from '../controllers/auctionController.js';

const router = Router();

router.get('/', listAuctionsController);
router.get('/:id', getAuctionController);
router.post('/', authRequired, requireRole(['admin']), createAuctionController);
router.put('/:id', authRequired, requireRole(['admin']), updateAuctionController);
router.delete('/:id', authRequired, requireRole(['admin']), deleteAuctionController);

export default router;
