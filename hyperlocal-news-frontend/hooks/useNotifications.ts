import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/utils/apiClient';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await ApiService.getNotifications();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load notifications');
      }
      return response.data;
    },
  });
};
