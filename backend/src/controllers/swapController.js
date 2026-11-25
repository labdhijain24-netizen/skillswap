import * as swapService from '../services/swapService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function createSwapRequest(req, res, next) {
  try {
    const { senderId, receiverId, offeredSkill, requestedSkill, message } = req.body;
    const effectiveSenderId = senderId || req.user?.id;

    if (!effectiveSenderId || !receiverId) {
      return errorResponse(res, 'Sender ID and Receiver ID are required.', 400);
    }
    if (!offeredSkill || !requestedSkill) {
      return errorResponse(res, 'Both an offered skill and a requested skill are required.', 400);
    }

    const swap = await swapService.createSwapRequest({
      senderId: effectiveSenderId,
      receiverId,
      offeredSkill,
      requestedSkill,
      message,
    });

    return successResponse(res, 'Skill exchange proposal submitted successfully!', swap, 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserSwapRequests(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const requests = await swapService.getUserSwapRequests(userId);
    return successResponse(res, 'User swap requests retrieved successfully.', requests);
  } catch (error) {
    next(error);
  }
}

export async function acceptSwapRequest(req, res, next) {
  try {
    const swapId = req.params.id;
    const userId = req.body.userId || req.user?.id;

    if (!swapId || !userId) {
      return errorResponse(res, 'Swap ID and User ID are required.', 400);
    }

    const updated = await swapService.acceptSwapRequest({ swapId, userId });
    return successResponse(res, 'Exchange proposal accepted! Match activated and chat enabled.', updated);
  } catch (error) {
    next(error);
  }
}

export async function rejectSwapRequest(req, res, next) {
  try {
    const swapId = req.params.id;
    const userId = req.body.userId || req.user?.id;
    const reason = req.body.reason || '';

    if (!swapId || !userId) {
      return errorResponse(res, 'Swap ID and User ID are required.', 400);
    }

    const updated = await swapService.rejectSwapRequest({ swapId, userId, reason });
    return successResponse(res, 'Exchange proposal rejected.', updated);
  } catch (error) {
    next(error);
  }
}

export async function cancelSwapRequest(req, res, next) {
  try {
    const swapId = req.params.id;
    const userId = req.body.userId || req.user?.id;

    if (!swapId || !userId) {
      return errorResponse(res, 'Swap ID and User ID are required.', 400);
    }

    const updated = await swapService.cancelSwapRequest({ swapId, userId });
    return successResponse(res, 'Exchange proposal cancelled.', updated);
  } catch (error) {
    next(error);
  }
}
