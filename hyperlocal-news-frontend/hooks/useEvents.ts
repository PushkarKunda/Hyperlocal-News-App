import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/utils/apiClient';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await ApiService.getEvents();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load events');
      }
      return response.data;
    },
  });
};
