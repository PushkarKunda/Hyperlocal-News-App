import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/utils/apiClient';

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
