import apiClient from './api';
import { Progress, Enrollment } from '../types';

export const progressService = {
  getCourseProgress: async (courseId: string): Promise<Progress> => {
    const response = await apiClient.get(`/progress/course/${courseId}`);
    return response.data;
  },

  getUserProgress: async (): Promise<Progress[]> => {
    const response = await apiClient.get('/progress/user');
    return response.data;
  },

  updateLessonProgress: async (
    courseId: string,
    lessonId: string,
    data: { watchedDuration?: number; isCompleted?: boolean }
  ): Promise<any> => {
    const response = await apiClient.post(`/progress/lesson/${courseId}/${lessonId}`, data);
    return response.data;
  },

  completeModule: async (courseId: string, moduleId: string): Promise<any> => {
    const response = await apiClient.post(`/progress/module/${courseId}/${moduleId}`);
    return response.data;
  },
};

export const enrollmentService = {
  enrollInCourse: async (courseId: string, careerId?: string): Promise<Enrollment> => {
    const response = await apiClient.post('/users/enroll', {
      courseId,
      careerId,
    });
    return response.data.enrollment;
  },

  getEnrollments: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get('/users/enrollments');
    return response.data;
  },
};
