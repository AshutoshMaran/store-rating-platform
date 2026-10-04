import { apiClient } from './api.client.js';

export const getOwnerDashboardApi = async () => {
  const response = await apiClient.get('/owner/dashboard');
  return response.data;
};
