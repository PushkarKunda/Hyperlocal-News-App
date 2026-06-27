// services/api/users.ts
import { API_ROUTES } from './routes';
import { request } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────
// ✅ Import User from authStore (single source of truth)
import type { User } from '@/store/authStore';

// ✅ Backend PATCH /user/user/users/me payload
// These match exactly what the backend accepts
export interface UpdateMePayload {
  user_name?: string;
  name?: string;
  profile_picture?: string | null; // null = clear field on backend
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  language?: string | null;
  state_id?: number | null;
  district_id?: number | null;
  city_id?: number | null;
}

// ✅ Backend PATCH /user/preferences/me payload
export interface UpdatePreferencesPayload {
  language?: string | null;
  state?: string | null;
  district?: string | null;
  interests?: string[] | null;
}

// ✅ Publisher Profile type
export interface PublisherProfile {
  id: string;
  user_uid: string;
  bio?: string;
  organization?: string;
  verified: boolean;
  created_at: string;
}

// ✅ User Preferences type
export interface UserPreferences {
  language?: string;
  state?: string;
  district?: string;
  interests?: string[];
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const usersApi = {

  // GET /user/user/users/me
  me: async (): Promise<User> => {
    return await request<User>({
      url: API_ROUTES.user.me,
      method: 'GET',
    });
  },

  // PATCH /user/user/users/me
  // ✅ FIXED: Uses UpdateMePayload (not Partial<User>), PATCH (not PUT)
  // ✅ FIXED: Removes undefined but KEEPS null (null clears field on backend)
  updateMe: async (payload: UpdateMePayload): Promise<User> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    return await request<User>({
      url: API_ROUTES.user.me,
      method: 'PATCH',
      data: cleanPayload,
    });
  },

  // PATCH /user/preferences/me
  updatePreferences: async (
    payload: UpdatePreferencesPayload
  ): Promise<UserPreferences> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    return await request<UserPreferences>({
      url: API_ROUTES.user.preferences,
      method: 'PATCH',
      data: cleanPayload,
    });
  },

  // POST /user/user/users/me/avatar (multipart)
  updateAvatar: async (avatarUrl: string): Promise<User> => {
    return await request<User>({
      url: `${API_ROUTES.user.me}/avatar`,
      method: 'PATCH',
      data: { avatarUrl },
    });
  },

  // GET /user/user/users/me/publisher-profile
  publisherProfile: async (): Promise<PublisherProfile> => {
    return await request<PublisherProfile>({
      url: `${API_ROUTES.user.me}/publisher-profile`,
      method: 'GET',
    });
  },

  // GET /user/user/dashboardnew
  dashboard: async (params?: {
    detailed?: boolean;
    page?: number;
    limit?: number;
    recent_limit?: number;
  }): Promise<any> => {
    return await request<any>({
      url: API_ROUTES.user.dashboard,
      method: 'GET',
      params: {
        detailed: params?.detailed ?? false,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        recent_limit: params?.recent_limit ?? 5,
      },
    });
  },
};