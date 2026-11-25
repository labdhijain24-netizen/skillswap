import * as dashboardService from '../services/dashboardService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export async function getDashboard(req, res, next) {
  try {
    const userId = req.params.userId || req.query.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'User ID is required.', 400);
    }

    const data = await dashboardService.getDashboardData(userId);

    if (data.error) {
      return errorResponse(res, data.error, 400);
    }

    return successResponse(res, 'Dashboard data retrieved.', data);
  } catch (error) {
    next(error);
  }
}
