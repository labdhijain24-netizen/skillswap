import * as healthService from '../services/healthService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Health Controller
 * Handles incoming HTTP requests for API health and diagnostics.
 */
export const getHealth = async (req, res, next) => {
  try {
    const healthData = await healthService.getSystemHealth();
    return successResponse(res, 'SkillSwap API is healthy and connected!', healthData);
  } catch (error) {
    next(error);
  }
};
