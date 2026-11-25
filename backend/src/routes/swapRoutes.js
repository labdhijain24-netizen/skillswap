import { Router } from 'express';
import {
  createSwapRequest,
  getUserSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
} from '../controllers/swapController.js';

const router = Router();

router.post('/request', createSwapRequest);
router.get('/user/:userId', getUserSwapRequests);
router.post('/:id/accept', acceptSwapRequest);
router.post('/:id/reject', rejectSwapRequest);
router.post('/:id/cancel', cancelSwapRequest);

export default router;
