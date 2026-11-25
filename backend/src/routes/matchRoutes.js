import { Router } from 'express';
import { getMatchRecommendations } from '../controllers/matchController.js';

const router = Router();

router.get('/recommendations', getMatchRecommendations);
router.get('/', getMatchRecommendations);

export default router;
