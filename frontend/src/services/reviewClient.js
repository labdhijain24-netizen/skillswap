import api from './api';

export const createReview = async ({ sessionId, reviewerId, rating, comment }) => {
  const response = await api.post('/reviews', {
    sessionId,
    reviewerId,
    rating,
    comment,
  });
  return response.data;
};

export const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data || [];
};

export const getSessionReviews = async (sessionId) => {
  const response = await api.get(`/reviews/session/${sessionId}`);
  return response.data || [];
};
