import { Router } from 'express';
import {
  createSession,
  getUserSessions,
  updateSession,
  completeSession,
  cancelSession,
} from '../controllers/sessionController.js';

const router = Router();

router.post('/', createSession);
router.get('/user/:userId', getUserSessions);
router.patch('/:id', updateSession);
router.post('/:id/complete', completeSession);
router.post('/:id/cancel', cancelSession);

export default router;
