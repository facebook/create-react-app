import apiClient from './api';
import { Course } from '../types';

export const courseService = {
  getAllCourses: async (filters?: {
    career?: string;
    difficulty?: string;
    published?: boolean;
  }): Promise<Course[]> => {
    const response = await apiClient.get('/courses', { params: filters });
    return response.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  publishCourse: async (id: string): Promise<{ message: string; course: Course }> => {
    const response = await apiClient.patch(`/courses/${id}/publish`);
    return response.data;
  },
};
