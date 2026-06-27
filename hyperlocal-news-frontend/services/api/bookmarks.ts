import { NewsArticle } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const bookmarksApi = {
  list: async () => {
    const response = await request<NewsArticle[]>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'GET',
    });
    return response;
  },

  add: async (articleId: string) => {
    const response = await request<any>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'POST',
      data: { articleId },
    });
    return response;
  },

  remove: async (id: string | number) => {
    const response = await request<any>({
      url: API_ROUTES.engagement.bookmarkById(Number(id)),
      method: 'DELETE',
    });
    return response;
  },
};
