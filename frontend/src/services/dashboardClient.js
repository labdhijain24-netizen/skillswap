import api from './api';

export const getDashboardData = async (userId) => {
  const response = await api.get(`/dashboard/user/${userId}`);
  return response.data;
};
