import * as communityService from '../services/communityService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getCommunityStats = async (req, res, next) => {
  try {
    const stats = await communityService.getCommunityStats();
    return successResponse(res, 'Community statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await communityService.getCategories();
    return successResponse(res, 'Skill categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSkills = async (req, res, next) => {
  try {
    const featured = await communityService.getFeaturedSkills();
    return successResponse(res, 'Featured skill opportunities retrieved', featured);
  } catch (error) {
    next(error);
  }
};

export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await communityService.getTestimonials();
    return successResponse(res, 'Testimonials retrieved', testimonials);
  } catch (error) {
    next(error);
  }
};
