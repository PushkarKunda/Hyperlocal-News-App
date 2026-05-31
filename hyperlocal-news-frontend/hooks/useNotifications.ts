import { useQuery } from '@tanstack/react-query';
import { MOCK_NOTIFICATIONS } from '@/data';
import { Notification } from '@/types';
import { API_CONFIG, notificationsApi } from '@/services/api';

const fetchNotifications = async (): Promise<Notification[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_NOTIFICATIONS), 600);
    });
  }

  return notificationsApi.list();
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: fetchNotifications,
  });
};
