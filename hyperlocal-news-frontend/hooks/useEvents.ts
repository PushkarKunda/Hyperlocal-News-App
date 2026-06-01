import { useQuery } from '@tanstack/react-query';

import { Event } from '@/types';
import { API_CONFIG, eventsApi } from '@/services/api';
import { API_DATABASE } from '@/utils/apiClient';

const fetchEvents = async (): Promise<Event[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(API_DATABASE.events as any), 800);
    });
  }

  return eventsApi.list();
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: fetchEvents,
  });
};
