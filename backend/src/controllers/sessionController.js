import * as sessionService from '../services/sessionService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function createSession(req, res, next) {
  try {
    const {
      swapRequestId,
      teacherId,
      learnerId,
      skillId,
      title,
      description,
      scheduledStart,
      scheduledEnd,
      meetingLink,
      scheduledByUserId,
    } = req.body;

    const user = req.user?.id || scheduledByUserId;

    const session = await sessionService.createSession({
      swapRequestId,
      teacherId,
      learnerId,
      skillId,
      title,
      description,
      scheduledStart,
      scheduledEnd,
      meetingLink,
      scheduledByUserId: user,
    });

    return successResponse(res, 'Session scheduled successfully!', session, 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserSessions(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const sessions = await sessionService.getUserSessions(userId);
    return successResponse(res, 'User sessions retrieved successfully.', sessions);
  } catch (error) {
    next(error);
  }
}

export async function updateSession(req, res, next) {
  try {
    const sessionId = req.params.id;
    const userId = req.body.userId || req.user?.id;
    const { scheduledStart, scheduledEnd, title, meetingLink, description } = req.body;

    if (!sessionId || !userId) {
      return errorResponse(res, 'Session ID and User ID are required.', 400);
    }

    const updated = await sessionService.updateSession({
      sessionId,
      userId,
      scheduledStart,
      scheduledEnd,
      title,
      meetingLink,
      description,
    });

    return successResponse(res, 'Session updated successfully.', updated);
  } catch (error) {
    next(error);
  }
}

export async function completeSession(req, res, next) {
  try {
    const sessionId = req.params.id;
    const userId = req.body.userId || req.user?.id;

    if (!sessionId || !userId) {
      return errorResponse(res, 'Session ID and User ID are required.', 400);
    }

    const updated = await sessionService.completeSession({ sessionId, userId });
    return successResponse(res, 'Session marked as completed! Don\'t forget to leave a review.', updated);
  } catch (error) {
    next(error);
  }
}

export async function cancelSession(req, res, next) {
  try {
    const sessionId = req.params.id;
    const userId = req.body.userId || req.user?.id;
    const reason = req.body.reason || '';

    if (!sessionId || !userId) {
      return errorResponse(res, 'Session ID and User ID are required.', 400);
    }

    const updated = await sessionService.cancelSession({ sessionId, userId, reason });
    return successResponse(res, 'Session cancelled.', updated);
  } catch (error) {
    next(error);
  }
}
