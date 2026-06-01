import { useQuery } from '@tanstack/react-query';

import { MOCK_CATEGORIES } from '@/data';
import { Category } from '@/types';
import { API_CONFIG, categoriesApi } from '@/services/api';

const fetchCategories = async (): Promise<Category[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CATEGORIES), 300);
    });
  }

  return categoriesApi.list();
};


export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await ApiService.getCategories();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load categories');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // categories rarely change — cache 30 min
  });
};
