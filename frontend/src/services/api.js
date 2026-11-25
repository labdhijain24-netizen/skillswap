import axios from 'axios';

/**
 * Centralized Axios instance for communicating with the SkillSwap backend.
 * Configured with base URL and standard timeouts.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent response and error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network request failed',
      status: error.response?.status || 0,
      details: error.response?.data || null,
    };
    return Promise.reject(customError);
  }
);

export default api;
