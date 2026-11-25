import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();

router.get('/user/:userId', getDashboard);

export default router;
