import * as exploreService from '../services/exploreService.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Controller: Explore community skills with search, filters, and sorting
 */
export async function getExploreSkills(req, res, next) {
  try {
    const result = await exploreService.getExploreSkills(req.query);
    return successResponse(res, `Retrieved ${result.total} skill offerings from the community catalog`, result);
  } catch (error) {
    next(error);
  }
}
