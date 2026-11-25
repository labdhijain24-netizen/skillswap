import api from './api';

export const getUserNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`);
  return response.data || [];
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const response = await api.post(`/notifications/${notificationId}/read`, {
    userId,
  });
  return response.data;
};

export const markAllNotificationsAsRead = async (userId) => {
  const response = await api.post('/notifications/read-all', {
    userId,
  });
  return response.data;
};
