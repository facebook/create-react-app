import { useState, useCallback } from 'react';
import { courseService } from '../services/course.service';
import { Course } from '../types';

interface UseCourseReturn {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  fetchCourses: (filters?: any) => Promise<void>;
  getCourseById: (id: string) => Promise<Course | null>;
  clearError: () => void;
}

export const useCourse = (): UseCourseReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAllCourses(filters);
      setCourses(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseById = useCallback(async (id: string): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    try {
      const course = await courseService.getCourseById(id);
      setCurrentCourse(course);
      return course;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch course');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    courses,
    currentCourse,
    loading,
    error,
    fetchCourses,
    getCourseById,
    clearError,
  };
};
