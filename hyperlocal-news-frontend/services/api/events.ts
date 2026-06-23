import { Event } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const eventsApi = {
  list: async () => {
    const response = await request<Event[]>({ url: API_ROUTES.content.events, method: 'GET' });
    return response;
  },
};
