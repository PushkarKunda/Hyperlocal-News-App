import { API_ROUTES } from './routes';
import { request } from './client';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface NewsLocation {
  city?: string;
  district?: string;
  state?: string;
}

export interface NewsEngagementDetail {
  // API returns these field names
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
  total_views?: number;
  unique_viewers?: number;
  avg_read_time?: number;

  // Also keep these for backward compatibility
  likes: number;
  comments: number;
  shares: number;
  views: number;
  user_liked: boolean;
}

export interface NewsArticle {
  news_uid: string;
  title: string;
  summary: string;
  image_url?: string;
  created_at: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  is_breaking: boolean;
  category_names: string[];
  location: NewsLocation;
  source: string;
  source_url?: string;
  source_name?: string;
  position?: number;
  ranking_score?: number;
  engagement?: NewsEngagementDetail;
}

import { Advertisement, SponsoredPost } from './content';


import { Category } from './categories';

export type FeedItemType = 'news' | 'ad' | 'sponsored' | 'event' | 'poll' | 'post';

export interface FeedItem {
  type: FeedItemType;
  data: NewsArticle | Advertisement | SponsoredPost;
  position: number;
  ranking_score?: number;
}

export interface FeedMetadata {
  total_items: number;
  returned_items: number;
  next_cursor: string | null;
  has_more: boolean;
  user_uid: string;
  hashtag_filter: string | null;
  feed_composition: {
    news: number;
    posts: number;
    ads: number;
    sponsored: number;
    events: number;
    polls: number;
  };
  ad_metadata: {
    ads_shown: number;
    premium_ad_shown: boolean;
    sponsored_shown: number;
    events_shown: number;
    polls_shown: number;
  };
  ranking_summary: {
    total_scored: number;
    top_score: number;
    avg_score: number;
  };
}

export interface NewsFeedResponse {
  items: FeedItem[];
  metadata: FeedMetadata;
}

export interface NewsFilters {
  cursor?: string;
  limit?: number;
  hashtag?: string;
  session_id?: string;
  include_ads?: boolean;
  include_sponsored?: boolean;
  include_events?: boolean;
  include_polls?: boolean;
  include_posts?: boolean;
  post_limit?: number;
}

export interface LocationNewsParams {
  state?: string;
  district?: string;
  city?: string;
  limit?: number;
}

export interface SearchNewsParams {
  q?: string;
  state_id?: number;
  district_id?: number;
  city_id?: number;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ─── CREATE/UPDATE PAYLOADS ────────────────────────────────────────────────

export interface CreateNewsPayload {
  title: string;
  summary: string;
  image_url?: string;
  language_id?: number;
  user_uid?: string; // Optional if auto-filled from auth
  city_id?: number;
  category_ids?: number[];
  source_url?: string;
  source_name?: string;
}

export interface UpdateNewsPayload {
  title?: string;
  summary?: string;
  image_url?: string;
  city_id?: number;
  category_ids?: number[];
  source_url?: string;
  source_name?: string;
}

// ─── COMMENTS ──────────────────────────────────────────────────────────────

export interface NewsComment {
  id: number;
  user_uid: string;
  user_name: string;
  user_avatar?: string;
  comment_text: string;
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
}

export interface CreateCommentPayload {
  comment_text: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════

export const newsApi = {
  // ─── FEED & DISCOVERY ──────────────────────────────────────────────────

  /**
   * GET /news/v1/feed
   * Full mixed feed: news + ads + sponsored
   */
  getFeed: async (filters?: NewsFilters): Promise<NewsFeedResponse> => {
    return await request<NewsFeedResponse>({
      url: API_ROUTES.news.feed,
      method: 'GET',
      params: filters,
    });
  },

  /**
   * GET /news/v1/news/:uid
   * Get single article
   */
  getById: async (uid: string): Promise<NewsArticle> => {
    return await request<NewsArticle>({
      url: API_ROUTES.news.byId(uid),
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/breaking
   */
  getBreaking: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.breaking,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/location
   * Local news by state/district/city
   */
  getByLocation: async (params: LocationNewsParams): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.byLocation,
      method: 'GET',
      params,
    });
  },

  /**
   * GET /news/v1/search
   * Search news with filters
   */
  search: async (params: SearchNewsParams): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.search,
      method: 'GET',
      params,
    });
  },

  // ─── CATEGORIES ────────────────────────────────────────────────────────

  /**
   * GET /categories/all
   */
  getAllCategories: async (): Promise<Category[]> => {
    return await request<Category[]>({
      url: API_ROUTES.categories.all,
      method: 'GET',
    });
  },

  /**
   * GET /categories/:id/news
   */
  getNewsByCategory: async (categoryId: number): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.categories.news(categoryId),
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/analytics/trending
   */
  getTrending: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.trending,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/popular
   */
  getPopular: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.popular,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news-shorts
   */
  getShorts: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.shorts,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/:uid/engagement
   */
  getEngagement: async (uid: string): Promise<NewsEngagementDetail> => {
    return await request<NewsEngagementDetail>({
      url: API_ROUTES.news.engagement(uid),
      method: 'GET',
    });
  },

  // ─── CREATE/UPDATE/DELETE (PUBLISHER) ──────────────────────────────────

  /**
   * POST /news/v1/news
   * Create new news article (Publishers only)
   * Returns: { success, message, news, status, next_steps }
   */
  create: async (payload: CreateNewsPayload): Promise<{
    success: boolean;
    message: string;
    news: NewsArticle;
    status: string;
    next_steps: string;
  }> => {
    return await request({
      url: API_ROUTES.news.create,
      method: 'POST',
      data: payload,
    });
  },

  /**
   * PUT /news/v1/news/:uid
   * Update existing article (Publisher only)
   */
  update: async (
    uid: string,
    payload: UpdateNewsPayload
  ): Promise<NewsArticle> => {
    return await request<NewsArticle>({
      url: API_ROUTES.news.byId(uid),
      method: 'PUT',
      data: payload,
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid
   * Delete article (Publisher only)
   */
  delete: async (uid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.deleteNews(uid),
      method: 'DELETE',
    });
  },

  // ─── ENGAGEMENT ────────────────────────────────────────────────────────

  /**
   * POST /news/v1/user/news/:uid/like
   */
  like: async (uid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.like(uid), method: 'POST' });
  },

  /**
   * DELETE /news/v1/user/news/:uid/like
   */
  unlike: async (uid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.like(uid), method: 'DELETE' });
  },

  /**
   * POST /news/v1/user/news/:uid/view
   */
  recordView: async (uid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.view(uid), method: 'POST' });
  },

  /**
   * POST /news/v1/user/news/:uid/share
   */
  recordShare: async (uid: string, platform?: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.share(uid),
      method: 'POST',
      data: { platform },
    });
  },

  // ─── COMMENTS ──────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/:uid/comments
   */
  getComments: async (uid: string): Promise<NewsComment[]> => {
    return await request<NewsComment[]>({
      url: API_ROUTES.news.comments(uid),
      method: 'GET',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/comment
   */
  addComment: async (
    uid: string,
    payload: CreateCommentPayload
  ): Promise<NewsComment> => {
    return await request<NewsComment>({
      url: API_ROUTES.news.comment(uid),
      method: 'POST',
      data: payload,
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid/comment/:id
   */
  deleteComment: async (uid: string, commentId: number): Promise<void> => {
    await request({
      url: API_ROUTES.news.deleteComment(uid, commentId),
      method: 'DELETE',
    });
  },
};