import { useQuery } from '@tanstack/react-query';
import { MOCK_NOTIFICATIONS } from '@/data';
import { Notification } from '@/types';

// Simulate an API call with a delay
const fetchNotifications = async (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_NOTIFICATIONS), 600);
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
};
