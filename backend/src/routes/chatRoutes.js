import { Router } from 'express';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../controllers/chatController.js';

const router = Router();

router.get('/conversations/:userId', getUserConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.post('/conversations/:conversationId/read', markConversationAsRead);

export default router;
