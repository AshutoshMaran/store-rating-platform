import { apiClient } from './api.client.js';

export const getDashboardStatsApi = async () => {
  const response = await apiClient.get('/admin/dashboard/stats');
  return response.data;
};

export const getAllUsersApi = async () => {
  const response = await apiClient.get('/admin/get/allUser');
  return response.data;
};

export const getAllStoresApi = async () => {
  const response = await apiClient.get('/admin/get/allStore');
  return response.data;
};

export const getAllRatingsApi = async () => {
  const response = await apiClient.get('/admin/get/allRating');
  return response.data;
};

export const addUserApi = async (userData) => {
  // Routes to role-specific endpoint or general
  let endpoint = '/admin/add/user';
  if (userData.role === 'ADMIN') {
    endpoint = '/admin/add/admin';
  } else if (userData.role === 'STORE_OWNER') {
    endpoint = '/admin/add/storeOwner';
  }
  const response = await apiClient.post(endpoint, userData);
  return response.data;
};

export const addStoreApi = async (storeData) => {
  const response = await apiClient.post('/admin/add/store', storeData);
  return response.data;
};

export const assignStoreOwnerApi = async (storeId, ownerId) => {
  const response = await apiClient.post(`/admin/assign/storeOwner/${storeId}`, { ownerId });
  return response.data;
};
