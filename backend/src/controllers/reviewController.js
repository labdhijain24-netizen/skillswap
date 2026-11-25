import * as reviewService from '../services/reviewService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function createReview(req, res, next) {
  try {
    const { sessionId, reviewerId, rating, comment } = req.body;
    const effectiveReviewer = reviewerId || req.user?.id;

    if (!sessionId || !effectiveReviewer) {
      return errorResponse(res, 'Session ID and Reviewer ID are required.', 400);
    }

    if (!rating) {
      return errorResponse(res, 'Rating is required (1 to 5).', 400);
    }

    const review = await reviewService.createReview({
      sessionId,
      reviewerId: effectiveReviewer,
      rating,
      comment,
    });

    return successResponse(res, 'Review submitted successfully! Thank you for your feedback.', review, 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const reviews = await reviewService.getUserReviews(userId);
    return successResponse(res, 'User reviews retrieved successfully.', reviews);
  } catch (error) {
    next(error);
  }
}

export async function getSessionReviews(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return errorResponse(res, 'Session ID is required.', 400);
    }

    const reviews = await reviewService.getSessionReviews(sessionId);
    return successResponse(res, 'Session reviews retrieved successfully.', reviews);
  } catch (error) {
    next(error);
  }
}
