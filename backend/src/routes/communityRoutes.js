import { Router } from 'express';
import { 
  getCommunityStats, 
  getCategories, 
  getFeaturedSkills, 
  getTestimonials 
} from '../controllers/communityController.js';

const router = Router();

router.get('/stats', getCommunityStats);
router.get('/categories', getCategories);
router.get('/featured-skills', getFeaturedSkills);
router.get('/testimonials', getTestimonials);

export default router;
