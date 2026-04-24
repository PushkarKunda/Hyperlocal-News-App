import { useQuery } from '@tanstack/react-query';
import { MOCK_EVENTS } from '@/data';
import { Event } from '@/types';

// Simulate an API call with a delay
const fetchEvents = async (): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_EVENTS), 800);
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};
