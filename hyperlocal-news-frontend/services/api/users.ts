// services/api/users.ts
import { API_ROUTES } from './routes';
import { request } from './client';
import type { User } from '@/store/authStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UpdateMePayload {
  user_name?: string;
  name?: string;
  profile_picture?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  language?: string | null;
  state_id?: number | null;
  district_id?: number | null;
  city_id?: number | null;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug?: string | null;
}

export interface CurrentUserProfile extends Omit<User, 'language_id' | 'state_id' | 'district_id' | 'city_id'> {
  language_id?: number | null;
  state_id?: number | null;
  district_id?: number | null;
  city_id?: number | null;
  language_name?: string | null;
  state_name?: string | null;
  district_name?: string | null;
  city_name?: string | null;
  categories?: CategorySummary[];
  category_ids?: number[] | null; // ✅ FIXED: Added null
}

export interface UpdatePreferencesPayload {
  language_id?: number | null;
  state_id?: number | null;
  district_id?: number | null;
  city_id?: number | null;
  category_ids?: number[] | null;
}

export interface UserPreferences {
  user_uid: string;
  language?: string | null;
  language_name?: string | null;
  state_id?: number | null;
  state_name?: string | null;
  district_id?: number | null;
  district_name?: string | null;
  city_id?: number | null;
  city_name?: string | null;
  categories?: CategorySummary[];
  category_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface SuspensionStatus {
  is_suspended: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_until?: string;
}

export interface UserDashboardStats {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  level: number;
  level_name?: string;
  coins: number;
  points: number;
  current_streak?: number;
  longest_streak?: number;
}

export interface UserDashboard {
  user?: {
    user_uid?: string;
    user_name?: string | null;
    name?: string | null;
    profile_picture?: string | null;
    location?: string | null;
    joined_date?: string | null;
    followers_count?: number;
    following_count?: number;
    role?: number;
    role_name?: string;
    is_publisher?: boolean;
    is_verified?: boolean;
    profile_completion?: number;
  };
  stats?: UserDashboardStats;
  recent_posts?: {
    items?: any[];
    total?: number;
    has_more?: boolean;
  };
  quick_actions?: any[];
  publisher_cta?: any;
  detailed_posts?: {
    items?: any[];
    pagination?: any;
  };
  total_news?: number;
  total_views?: number;
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
  recent_news?: any[];
}

export interface DashboardEngagement {
  daily_views: number;
  daily_likes: number;
  daily_comments: number;
  daily_shares: number;
  weekly_trend: any[];
}

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * GET /user/user/users/me
   * Get current user profile (works for both regular users and publishers)
   */
  me: async (): Promise<CurrentUserProfile> => {
    return await request<CurrentUserProfile>({
      url: API_ROUTES.user.me,
      method: 'GET',
      params: {
        include_preferences: true,
      },
    });
  },

  /**
   * PATCH /user/user/users/me
   * Update user profile
   * Strips null but KEEPS null (null clears field on backend)
   */
  updateMe: async (payload: UpdateMePayload): Promise<User> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== null)
    ) as UpdateMePayload;

    return await request<User>({
      url: API_ROUTES.user.me,
      method: 'PATCH',
      data: cleanPayload,
    });
  },

  /**
   * PATCH /user/user/preferences/me
   * Update user preferences
   */
  updatePreferences: async (
    payload: UpdatePreferencesPayload
  ): Promise<UserPreferences> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== null)
    ) as UpdatePreferencesPayload;

    return await request<UserPreferences>({
      url: API_ROUTES.user.preferences,
      method: 'PATCH',
      data: cleanPayload,
    });
  },

  /**
   * POST /user/user/preferences/me
   * Create or replace onboarding preferences
   */
  savePreferences: async (
    payload: UpdatePreferencesPayload
  ): Promise<UserPreferences> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== null)
    ) as UpdatePreferencesPayload;

    return await request<UserPreferences>({
      url: API_ROUTES.user.preferences,
      method: 'POST',
      data: cleanPayload,
    });
  },

  /**
   * GET /user/user/preferences/me
   * Get user preferences
   */
  getPreferences: async (): Promise<UserPreferences> => {
    return await request<UserPreferences>({
      url: API_ROUTES.user.preferences,
      method: 'GET',
    });
  },

  /**
   * GET /user/user/users/me/suspension-status
   * Check if user is suspended
   */
  suspensionStatus: async (): Promise<SuspensionStatus> => {
    return await request<SuspensionStatus>({
      url: API_ROUTES.user.suspensionStatus,
      method: 'GET',
    });
  },

  /**
   * GET /user/user/dashboardnew
   * Get user dashboard stats
   */
  dashboard: async (params?: {
    detailed?: boolean;
    page?: number;
    limit?: number;
    recent_limit?: number;
  }): Promise<UserDashboard> => {
    return await request<UserDashboard>({
      url: API_ROUTES.user.dashboard,
      method: 'GET',
      params: {
        detailed: params?.detailed ?? true,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        recent_limit: params?.recent_limit ?? 5,
      },
    });
  },

  /**
   * GET /user/user/dashboard/engagement
   * Get user engagement metrics
   */
  dashboardEngagement: async (): Promise<DashboardEngagement> => {
    return await request<DashboardEngagement>({
      url: API_ROUTES.user.dashboardEngagement,
      method: 'GET',
    });
  },
};