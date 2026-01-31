import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import vehicleRoutes from './vehicles.js';
import auctionRoutes from './auctions.js';
import bidRoutes from './bids.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/auctions', auctionRoutes);
router.use('/bids', bidRoutes);

export default router;
