import api from './api';

export const createSession = async ({
  swapRequestId,
  teacherId,
  learnerId,
  skillId,
  title,
  description,
  scheduledStart,
  scheduledEnd,
  meetingLink,
  scheduledByUserId,
}) => {
  const response = await api.post('/sessions', {
    swapRequestId,
    teacherId,
    learnerId,
    skillId,
    title,
    description,
    scheduledStart,
    scheduledEnd,
    meetingLink,
    scheduledByUserId,
  });
  return response.data;
};

export const getUserSessions = async (userId) => {
  const response = await api.get(`/sessions/user/${userId}`);
  return response.data || { upcoming: [], completed: [], cancelled: [] };
};

export const updateSession = async (sessionId, { userId, scheduledStart, scheduledEnd, title, meetingLink, description }) => {
  const response = await api.patch(`/sessions/${sessionId}`, {
    userId,
    scheduledStart,
    scheduledEnd,
    title,
    meetingLink,
    description,
  });
  return response.data;
};

export const completeSession = async (sessionId, userId) => {
  const response = await api.post(`/sessions/${sessionId}/complete`, { userId });
  return response.data;
};

export const cancelSession = async (sessionId, userId, reason = '') => {
  const response = await api.post(`/sessions/${sessionId}/cancel`, { userId, reason });
  return response.data;
};
