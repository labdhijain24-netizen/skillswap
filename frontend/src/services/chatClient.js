import api from './api';

export const getUserConversations = async (userId) => {
  const response = await api.get(`/chat/conversations/${userId}`);
  return response.data || [];
};

export const getConversationMessages = async (conversationId, userId) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { userId },
  });
  return response.data || [];
};

export const sendMessage = async ({ conversationId, senderId, content }) => {
  const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
    senderId,
    content,
  });
  return response.data;
};

export const markConversationAsRead = async (conversationId, userId) => {
  const response = await api.post(`/chat/conversations/${conversationId}/read`, {
    userId,
  });
  return response.data;
};
