import { apiClient } from './api.client.js';

export const loginApi = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async (role) => {
  const url = role ? `/auth/me?role=${role}` : '/auth/me';
  const response = await apiClient.get(url);
  return response.data;
};

export const refreshTokenApi = async () => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const updatePasswordApi = async (passwordData) => {
  const response = await apiClient.post('/auth/update-password', passwordData);
  return response.data;
};