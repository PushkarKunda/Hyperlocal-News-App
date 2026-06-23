import { useQuery } from '@tanstack/react-query';

import { notificationsApi } from '@/services/api';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'api'],
    queryFn: () => notificationsApi.list(),
  });
};
