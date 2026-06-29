// services/api/news.ts
import { API_ROUTES } from './routes';
import { request } from './client';

// Import Advertisement and SponsoredPost from content.ts (don't redefine)
import type { Advertisement, SponsoredPost } from './content';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NewsLocation {
  city?: string;
  district?: string;
  state?: string;
}

export interface NewsStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
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
  position?: number;
  ranking_score?: number;
}


export type FeedItemType = 'news' | 'ad' | 'sponsored';

export interface FeedItem {
  type: FeedItemType;
  data: NewsArticle | Advertisement | SponsoredPost;
  position: number;
  ranking_score?: number;
}

export interface FeedComposition {
  news: number;
  posts: number;
  ads: number;
  sponsored: number;
  events: number;
  polls: number;
}

export interface AdMetadata {
  ads_shown: number;
  premium_ad_shown: boolean;
  sponsored_shown: number;
  events_shown: number;
  polls_shown: number;
}

export interface RankingSummary {
  total_scored: number;
  top_score: number;
  avg_score: number;
}

export interface FeedMetadata {
  total_items: number;
  returned_items: number;
  next_cursor: string | null;
  has_more: boolean;
  user_uid: string;
  hashtag_filter: string | null;
  feed_composition: FeedComposition;
  ad_metadata: AdMetadata;
  ranking_summary: RankingSummary;
}

export interface NewsFeedResponse {
  items: FeedItem[];
  metadata: FeedMetadata;
}

export interface NewsFilters {
  cursor?: string;
  limit?: number;
  category_id?: number;
  location?: string;
  is_breaking?: boolean;
  hashtag?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface CreateNewsPayload {
  title: string;
  summary: string;
  content?: string;
  image_url?: string;
  category_id?: number;
  city_id?: number;
  district_id?: number;
  state_id?: number;
  is_breaking?: boolean;
  tags?: string[];
}

export interface UpdateNewsPayload {
  title?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  category_id?: number;
  is_breaking?: boolean;
  tags?: string[];
}

export interface NewsEngagement {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  unique_viewers: number;
  avg_read_time?: number;
}

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

export interface SearchNewsParams {
  query: string;
  limit?: number;
  offset?: number;
  category_id?: number;
  location?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const newsApi = {
  /**
   * GET /news/v1/feed
   * Get personalized news feed with ads and sponsored content
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
   * Get single news article by UID
   */
  getById: async (uid: string): Promise<NewsArticle> => {
    return await request<NewsArticle>({
      url: API_ROUTES.news.byId(uid),
      method: 'GET',
    });
  },

  /**
   * POST /news/v1/news
   * Create new news article (Publisher only)
   */
  create: async (payload: CreateNewsPayload): Promise<NewsArticle> => {
    return await request<NewsArticle>({
      url: API_ROUTES.news.create,
      method: 'POST',
      data: payload,
    });
  },

  /**
   * PUT /news/v1/news/:uid
   * Update news article (Publisher only)
   */
  update: async (uid: string, payload: UpdateNewsPayload): Promise<NewsArticle> => {
    return await request<NewsArticle>({
      url: API_ROUTES.news.byId(uid),
      method: 'PUT',
      data: payload,
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid
   * Delete news article (Publisher only)
   */
  delete: async (uid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.deleteNews(uid),
      method: 'DELETE',
    });
  },

  // ─── Discovery ────────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/breaking
   * Get breaking news
   */
  getBreaking: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.breaking,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/popular
   * Get popular news
   */
  getPopular: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.popular,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/analytics/trending
   * Get trending news
   */
  getTrending: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.trending,
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/location
   * Get news by location
   */
  getByLocation: async (params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    city?: string;
    district?: string;
    state?: string;
  }): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.byLocation,
      method: 'GET',
      params,
    });
  },

  /**
   * GET /news/v1/news/category/:id
   * Get news by category
   */
  getByCategory: async (categoryId: number): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.byCategory(categoryId),
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/news/:uid/related
   * Get related news articles
   */
  getRelated: async (uid: string): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.related(uid),
      method: 'GET',
    });
  },

  /**
   * GET /news/v1/search
   * Search news
   */
  search: async (params: SearchNewsParams): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.search,
      method: 'GET',
      params,
    });
  },

  // ─── News Shorts ──────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news-shorts
   * Get short-form news content
   */
  getShorts: async (): Promise<NewsArticle[]> => {
    return await request<NewsArticle[]>({
      url: API_ROUTES.news.shorts,
      method: 'GET',
    });
  },

  // ─── Engagement ───────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/:uid/engagement
   * Get engagement stats for a news article
   */
  getEngagement: async (uid: string): Promise<NewsEngagement> => {
    return await request<NewsEngagement>({
      url: API_ROUTES.news.engagement(uid),
      method: 'GET',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/like
   * Like a news article
   */
  like: async (uid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.like(uid),
      method: 'POST',
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid/like
   * Unlike a news article
   */
  unlike: async (uid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.like(uid),
      method: 'DELETE',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/view
   * Record a view for a news article
   */
  recordView: async (uid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.view(uid),
      method: 'POST',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/share
   * Record a share for a news article
   */
  recordShare: async (uid: string, platform?: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.share(uid),
      method: 'POST',
      data: { platform },
    });
  },

  // ─── Comments ─────────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/:uid/comments
   * Get comments for a news article
   */
  getComments: async (uid: string): Promise<NewsComment[]> => {
    return await request<NewsComment[]>({
      url: API_ROUTES.news.comments(uid),
      method: 'GET',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/comment
   * Add a comment to a news article
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
   * Delete a comment
   */
  deleteComment: async (uid: string, commentId: number): Promise<void> => {
    await request({
      url: API_ROUTES.news.deleteComment(uid, commentId),
      method: 'DELETE',
    });
  },
};