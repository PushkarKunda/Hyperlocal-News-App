import { API_ROUTES } from './routes';
import { request } from './client';

export const eventsApi = {
  list: async () => {
    const response = await request<any>({ url: API_ROUTES.content.events, method: 'GET' });
    if (response && typeof response === 'object' && Array.isArray(response.items)) {
      return response.items as Event[];
    }
    if (Array.isArray(response)) {
      return response as Event[];
    }
    return [];
  },
};
