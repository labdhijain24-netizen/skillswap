import api from './api';

/**
 * Calls the backend /api/health endpoint to verify client-server communication
 * and retrieve database connectivity status.
 */
export const checkBackendHealth = async () => {
  return await api.get('/health');
};
