import { useQuery } from '@tanstack/react-query';

import { MOCK_EVENTS } from '@/data';
import { Event } from '@/types';
import { API_CONFIG, eventsApi } from '@/services/api';

const fetchEvents = async (): Promise<Event[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_EVENTS), 800);
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
