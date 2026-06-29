// services/api/engagement.ts
import { API_ROUTES } from './routes';
import { request } from './client';

// Import shared types from news.ts (don't redefine them)
import type {
  NewsArticle,
  NewsComment,
  CreateCommentPayload,
  NewsEngagement
} from './news';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES - Engagement-specific only
// ═══════════════════════════════════════════════════════════════════════════

export interface Bookmark {
  id: number;
  user_uid: string;
  news_uid: string;
  created_at: string;
  news?: NewsArticle;
}

export interface BookmarkCheckResponse {
  is_bookmarked: boolean;
  bookmark_id?: number;
}

export interface EngagementSummary {
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_views: number;
  total_bookmarks: number;
}


// ═══════════════════════════════════════════════════════════════════════════
// API - Unified engagement actions for all content types
// ═══════════════════════════════════════════════════════════════════════════

export const engagementApi = {

  // ───────────────────────────────────────────────────────────────────────────
  // BOOKMARKS - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * GET /engagement/bookmarks
   * Get all bookmarked content
   */
  getBookmarks: async (): Promise<Bookmark[]> => {
    return await request<Bookmark[]>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'GET',
    });
  },

  /**
   * POST /engagement/bookmarks
   * Add bookmark { news_uid: string }
   * Works for: news, shorts, posts, local news
   */
  addBookmark: async (contentUid: string): Promise<Bookmark> => {
    return await request<Bookmark>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'POST',
      data: { news_uid: contentUid }, // Backend expects 'news_uid' for all content
    });
  },

  /**
   * DELETE /engagement/bookmarks
   * Remove bookmark { news_uid: string }
   */
  removeBookmark: async (contentUid: string): Promise<void> => {
    await request({
      url: API_ROUTES.engagement.bookmarks,
      method: 'DELETE',
      data: { news_uid: contentUid },
    });
  },

  /**
   * DELETE /engagement/bookmarks/:id
   * Delete bookmark by ID (alternative method)
   */
  deleteBookmarkById: async (bookmarkId: number): Promise<void> => {
    await request({
      url: API_ROUTES.engagement.bookmarkById(bookmarkId),
      method: 'DELETE',
    });
  },

  /**
   * GET /engagement/bookmarks/check?news_uid=xxx
   * Check if content is bookmarked
   */
  checkBookmark: async (contentUid: string): Promise<BookmarkCheckResponse> => {
    return await request<BookmarkCheckResponse>({
      url: API_ROUTES.engagement.checkBookmark,
      method: 'GET',
      params: { news_uid: contentUid },
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // LIKES - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * POST /news/v1/user/news/:uid/like
   * Like content (news, shorts, posts, local news)
   */
  like: async (contentUid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.like(contentUid),
      method: 'POST',
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid/like
   * Unlike content
   */
  unlike: async (contentUid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.like(contentUid),
      method: 'DELETE',
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // VIEWS - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * POST /news/v1/user/news/:uid/view
   * Record a view for content
   */
  recordView: async (contentUid: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.view(contentUid),
      method: 'POST',
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // SHARES - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * POST /news/v1/user/news/:uid/share
   * Record a share { platform?: string }
   * Platform examples: 'whatsapp', 'facebook', 'twitter', 'telegram', 'copy_link'
   */
  recordShare: async (contentUid: string, platform?: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.share(contentUid),
      method: 'POST',
      data: { platform },
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // COMMENTS - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/:uid/comments
   * Get comments for content
   */
  getComments: async (contentUid: string): Promise<NewsComment[]> => {
    return await request<NewsComment[]>({
      url: API_ROUTES.news.comments(contentUid),
      method: 'GET',
    });
  },

  /**
   * POST /news/v1/user/news/:uid/comment
   * Add a comment { comment_text: string }
   */
  addComment: async (
    contentUid: string,
    payload: CreateCommentPayload
  ): Promise<NewsComment> => {
    return await request<NewsComment>({
      url: API_ROUTES.news.comment(contentUid),
      method: 'POST',
      data: payload,
    });
  },

  /**
   * DELETE /news/v1/user/news/:uid/comment/:id
   * Delete a comment
   */
  deleteComment: async (contentUid: string, commentId: number): Promise<void> => {
    await request({
      url: API_ROUTES.news.deleteComment(contentUid, commentId),
      method: 'DELETE',
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ENGAGEMENT STATS - Works for news, shorts, posts, local news
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * GET /news/v1/news/:uid/engagement
   * Get engagement stats (views, likes, comments, shares)
   */
  getStats: async (contentUid: string): Promise<NewsEngagement> => {
    return await request<NewsEngagement>({
      url: API_ROUTES.news.engagement(contentUid),
      method: 'GET',
    });
  },

  /**
   * GET /engagement/summary/:uid
   * Get comprehensive engagement summary including bookmarks
   */
  getSummary: async (contentUid: string): Promise<EngagementSummary> => {
    return await request<EngagementSummary>({
      url: API_ROUTES.engagement.summary(contentUid),
      method: 'GET',
    });
  },
};

// Re-export shared types for convenience
export type { NewsComment, CreateCommentPayload, NewsEngagement } from './news';