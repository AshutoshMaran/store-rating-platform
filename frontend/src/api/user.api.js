import { apiClient } from './api.client.js';

export const getAllStoresApi = async () => {
  const response = await apiClient.get('/user/get/allStore');
  return response.data;
};

export const getStoreDetailsApi = async (storeId) => {
  const response = await apiClient.get(`/user/get/store/${storeId}`);
  return response.data;
};

export const rateStoreApi = async (storeId, rating) => {
  const response = await apiClient.post(`/user/rate/store/${storeId}`, { rating: Number(rating) });
  return response.data;
};

export const resetPasswordApi = async (password) => {
  const response = await apiClient.post('/user/reset/password', { password });
  return response.data;
};
