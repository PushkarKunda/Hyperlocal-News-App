import { User, UserPreferences, PublisherProfile } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const usersApi = {
  me: async () => {
    const response = await request<User>({ url: API_ROUTES.usersMe, method: 'GET' });
    return response.data;
  },

  updatePreferences: async (payload: Partial<UserPreferences>) => {
    const response = await request<UserPreferences>({
      url: API_ROUTES.usersMePreferences,
      method: 'PATCH',
      data: payload,
    });
    return response.data;
  },

  updateAvatar: async (avatarUrl: string) => {
    const response = await request<User>({
      url: API_ROUTES.usersMeAvatar,
      method: 'PATCH',
      data: { avatarUrl },
    });
    return response.data;
  },

  publisherProfile: async () => {
    const response = await request<PublisherProfile>({
      url: `${API_ROUTES.usersMe}/publisher-profile`,
      method: 'GET',
    });
    return response.data;
  },
};
