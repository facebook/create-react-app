import { useState, useCallback } from 'react';
import { careerService } from '../services/career.service';
import { Career } from '../types';

interface UseCareerReturn {
  careers: Career[];
  loading: boolean;
  error: string | null;
  fetchCareers: (featured?: boolean) => Promise<void>;
  getCareerById: (id: string) => Promise<Career | null>;
  clearError: () => void;
}

export const useCareer = (): UseCareerReturn => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = useCallback(async (featured?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await careerService.getAllCareers(featured);
      setCareers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCareerById = useCallback(async (id: string): Promise<Career | null> => {
    setLoading(true);
    setError(null);
    try {
      const career = await careerService.getCareerById(id);
      return career;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch career');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    careers,
    loading,
    error,
    fetchCareers,
    getCareerById,
    clearError,
  };
};
