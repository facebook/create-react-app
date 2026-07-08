import apiClient from './api';
import { User } from '../types';

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
};
