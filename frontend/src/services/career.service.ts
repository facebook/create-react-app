import apiClient from './api';
import { Career } from '../types';

export const careerService = {
  getAllCareers: async (featured?: boolean): Promise<Career[]> => {
    const response = await apiClient.get('/careers', {
      params: { featured },
    });
    return response.data;
  },

  getCareerById: async (id: string): Promise<Career> => {
    const response = await apiClient.get(`/careers/${id}`);
    return response.data;
  },

  createCareer: async (data: Partial<Career>): Promise<Career> => {
    const response = await apiClient.post('/careers', data);
    return response.data;
  },

  updateCareer: async (id: string, data: Partial<Career>): Promise<Career> => {
    const response = await apiClient.put(`/careers/${id}`, data);
    return response.data;
  },

  deleteCareer: async (id: string): Promise<void> => {
    await apiClient.delete(`/careers/${id}`);
  },
};
