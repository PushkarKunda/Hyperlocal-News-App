import { Notification } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const notificationsApi = {
  list: async () => {
    const response = await request<Notification[]>({
      url: API_ROUTES.engagement.notifications,
      method: 'GET',
    });
    return response;
  },
};
