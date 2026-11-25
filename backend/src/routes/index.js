import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import communityRoutes from './communityRoutes.js';
import matchRoutes from './matchRoutes.js';
import exploreRoutes from './exploreRoutes.js';
import swapRoutes from './swapRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const router = Router();

/**
 * Main API Router
 * All modular routes are registered here under /api/*
 */
router.use('/health', healthRoutes);
router.use('/community', communityRoutes);
router.use('/matches', matchRoutes);
router.use('/explore', exploreRoutes);
router.use('/swaps', swapRoutes);
router.use('/sessions', sessionRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reviews', reviewRoutes);

export default router;
