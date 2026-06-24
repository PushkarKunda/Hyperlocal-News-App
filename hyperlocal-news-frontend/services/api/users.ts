import { User, UserPreferences, PublisherProfile } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';

export const usersApi = {
  me: async () => {
    const response = await request<User>({ url: API_ROUTES.user.me, method: 'GET' });
    return response;
  },

  updateMe: async (payload: Partial<User>) => {
    const response = await request<User>({
      url: API_ROUTES.user.me,
      method: 'PATCH',
      data: payload,
    });
    return response;
  },

  updatePreferences: async (payload: Partial<UserPreferences>) => {
    const response = await request<UserPreferences>({
      url: API_ROUTES.user.preferences,
      method: 'PATCH',
      data: payload,
    });
    return response;
  },

  updateAvatar: async (avatarUrl: string) => {
    const response = await request<User>({
      url: `${API_ROUTES.user.me}/avatar`,
      method: 'PATCH',
      data: { avatarUrl },
    });
    return response;
  },

  publisherProfile: async () => {
    const response = await request<PublisherProfile>({
      url: `${API_ROUTES.user.me}/publisher-profile`,
      method: 'GET',
    });
    return response;
  },

  dashboard: async (params?: { detailed?: boolean; page?: number; limit?: number; recent_limit?: number }) => {
    const response = await request<any>({
      url: API_ROUTES.user.dashboard,
      method: 'GET',
      params: {
        detailed: params?.detailed ?? false,
        page: String(params?.page ?? 1),
        limit: String(params?.limit ?? 20),
        recent_limit: String(params?.recent_limit ?? 5),
      },
    });
    return response;
  },
};

