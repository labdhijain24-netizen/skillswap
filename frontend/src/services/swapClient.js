import api from './api';

export const createSwapRequest = async ({ senderId, receiverId, offeredSkill, requestedSkill, message }) => {
  const response = await api.post('/swaps/request', {
    senderId,
    receiverId,
    offeredSkill,
    requestedSkill,
    message,
  });
  return response.data;
};

export const getUserSwapRequests = async (userId) => {
  const response = await api.get(`/swaps/user/${userId}`);
  return response.data || { incoming: [], outgoing: [] };
};

export const acceptSwapRequest = async (swapId, userId) => {
  const response = await api.post(`/swaps/${swapId}/accept`, { userId });
  return response.data;
};

export const rejectSwapRequest = async (swapId, userId, reason = '') => {
  const response = await api.post(`/swaps/${swapId}/reject`, { userId, reason });
  return response.data;
};

export const cancelSwapRequest = async (swapId, userId) => {
  const response = await api.post(`/swaps/${swapId}/cancel`, { userId });
  return response.data;
};
