import { useQuery } from '@tanstack/react-query';

import { Category } from '@/types';
import { API_CONFIG, categoriesApi } from '@/services/api';
import { API_DATABASE } from '@/utils/apiClient';

const fetchCategories = async (): Promise<Category[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(API_DATABASE.categories), 300);
    });
  }

  return categoriesApi.list();
};


export const useCategories = () => {
  return useQuery({
    queryKey: ['categories', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // categories rarely change — cache 30 min
  });
};
