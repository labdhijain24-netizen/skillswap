import { Router } from 'express';
import {
  createReview,
  getUserReviews,
  getSessionReviews,
} from '../controllers/reviewController.js';

const router = Router();

router.post('/', createReview);
router.get('/user/:userId', getUserReviews);
router.get('/session/:sessionId', getSessionReviews);

export default router;
