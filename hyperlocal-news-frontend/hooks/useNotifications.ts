import { useQuery } from '@tanstack/react-query';

import { Notification } from '@/types';
import { API_CONFIG, notificationsApi } from '@/services/api';
import { API_DATABASE } from '@/utils/apiClient';

const fetchNotifications = async (): Promise<Notification[]> => {
  if (API_CONFIG.useMocks) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(API_DATABASE.notifications), 600);
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
