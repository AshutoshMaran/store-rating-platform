import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to automatically refresh expired access token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized, not already retried, and not the login/refresh/me endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/me')
    ) {
      originalRequest._retry = true;

      try {
        let role = '';
        if (originalRequest.url?.includes('/admin')) role = 'ADMIN';
        else if (originalRequest.url?.includes('/user')) role = 'USER';
        else if (originalRequest.url?.includes('/owner')) role = 'STORE_OWNER';

        await axios.post(`${BACKEND_URL}/auth/refresh?role=${role}`, {}, { withCredentials: true });

        // Retry the original request with the refreshed access token cookie
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, session is completely expired; redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);