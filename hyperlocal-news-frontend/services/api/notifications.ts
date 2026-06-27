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

  markRead: async (id: string | number) => {
    const response = await request<any>({
      url: API_ROUTES.engagement.markRead(Number(id)),
      method: 'PATCH',
    });
    return response;
  },

  markAllRead: async () => {
    const response = await request<any>({
      url: API_ROUTES.engagement.markAllRead,
      method: 'PATCH',
    });
    return response;
  },

  clearAll: async () => {
    const response = await request<any>({
      url: API_ROUTES.engagement.clearAll,
      method: 'DELETE',
    });
    return response;
  },
};
