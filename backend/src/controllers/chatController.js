import * as chatService from '../services/chatService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getUserConversations(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const conversations = await chatService.getUserConversations(userId);
    return successResponse(res, 'Conversations retrieved successfully.', conversations);
  } catch (error) {
    next(error);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.query.userId || req.user?.id;

    if (!conversationId || !userId) {
      return errorResponse(res, 'Conversation ID and User ID are required.', 400);
    }

    const messages = await chatService.getConversationMessages(conversationId, userId);
    return successResponse(res, 'Messages retrieved successfully.', messages);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversationId = req.params.conversationId;
    const { senderId, content } = req.body;
    const effectiveSender = senderId || req.user?.id;

    if (!conversationId || !effectiveSender) {
      return errorResponse(res, 'Conversation ID and Sender ID are required.', 400);
    }
    if (!content || !content.trim()) {
      return errorResponse(res, 'Message content cannot be empty.', 400);
    }

    const message = await chatService.sendMessage({
      conversationId,
      senderId: effectiveSender,
      content,
    });

    return successResponse(res, 'Message sent successfully.', message, 201);
  } catch (error) {
    next(error);
  }
}

export async function markConversationAsRead(req, res, next) {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.body.userId || req.user?.id;

    if (!conversationId || !userId) {
      return errorResponse(res, 'Conversation ID and User ID are required.', 400);
    }

    await chatService.markConversationAsRead({ conversationId, userId });
    return successResponse(res, 'Conversation marked as read.');
  } catch (error) {
    next(error);
  }
}
