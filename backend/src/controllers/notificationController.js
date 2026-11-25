import * as notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getUserNotifications(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const notifications = await notificationService.getUserNotifications(userId);
    return successResponse(res, 'Notifications retrieved.', notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const notificationId = req.params.id;
    const userId = req.body.userId || req.user?.id;

    if (!notificationId || !userId) {
      return errorResponse(res, 'Notification ID and User ID are required.', 400);
    }

    const data = await notificationService.markNotificationAsRead(notificationId, userId);
    return successResponse(res, 'Notification marked as read.', data);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    await notificationService.markAllNotificationsAsRead(userId);
    return successResponse(res, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
}
