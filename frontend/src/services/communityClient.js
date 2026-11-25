import api from './api';

/**
 * Frontend Client Service for Community & Discovery Data
 * Sourced directly from Express backend and Supabase PostgreSQL
 */

export const fetchCommunityStats = async () => {
  const response = await api.get('/community/stats');
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/community/categories');
  return response.data?.categories || [];
};

export const fetchFeaturedSkills = async () => {
  const response = await api.get('/community/featured-skills');
  return response.data;
};

export const fetchTestimonials = async () => {
  const response = await api.get('/community/testimonials');
  return response.data;
};

export const fetchExploreSkills = async (params = {}) => {
  const response = await api.get('/explore/skills', { params });
  return response.data || { data: [], total: 0 };
};

export const fetchMatchRecommendations = async (userId, params = {}) => {
  const response = await api.get('/matches/recommendations', {
    params: { userId, ...params },
  });
  return response.data?.matches || [];
};
