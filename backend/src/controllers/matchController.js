import * as matchService from '../services/matchService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Controller: Get Intelligent Match Recommendations
 */
export async function getMatchRecommendations(req, res, next) {
  try {
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return errorResponse(res, 'A valid userId parameter is required to generate match recommendations', 400);
    }

    const limit = parseInt(req.query.limit, 10) || 10;
    const minScore = parseInt(req.query.minScore, 10) || 15;

    const matches = await matchService.getMatchesForUser(userId, { limit, minScore });

    return successResponse(
      res,
      `Calculated ${matches.length} intelligent skill matches using 4-factor normalized algorithm`,
      {
        matches,
        count: matches.length,
        weights: {
          skillCompatibility: '50%',
          availabilityOverlap: '25%',
          sharedInterests: '15%',
          reliabilityScore: '10%',
        },
      }
    );
  } catch (error) {
    next(error);
  }
}
