import { Router } from 'express';
import { getExploreSkills } from '../controllers/exploreController.js';

const router = Router();

router.get('/skills', getExploreSkills);
router.get('/', getExploreSkills);

export default router;
