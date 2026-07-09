import { API_ROUTES } from './routes';
import { request } from './client';
import type { NewsArticle, NewsComment, CreateCommentPayload } from './news';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Bookmark {
  id: number;
  user_uid: string;
  content_type: string;
  content_id: number; // API uses integer
  created_at: string;
  news?: NewsArticle;

  // DEPRECATED: For backward compatibility until numeric ID is confirmed
  // Will be removed once GET /news/v1/news/:uid returns numeric ID
  news_uid?: string;
}

export interface BookmarksListResponse {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  items: Bookmark[];
}

export interface BookmarkCheckResponse {
  is_bookmarked: boolean;
  bookmark_id?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════════════════

export const engagementApi = {

  // ─── BOOKMARKS ──────────────────────────────────────────────────────────

  /**
   * GET /engagement/bookmarks?content_type=news&limit=50&offset=0
   */
  getBookmarks: async (
    contentType: string = 'news',
    limit: number = 50,
    offset: number = 0
  ): Promise<Bookmark[]> => {
    const response = await request<BookmarksListResponse>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'GET',
      params: { content_type: contentType, limit, offset },
    });
    return response.items ?? [];
  },

  /**
   * POST /engagement/bookmarks
   * { user_uid, content_type, content_id (integer) }
   * TODO: Replace contentId with actual numeric ID from
   * GET /news/v1/news/:uid response once confirmed
   */
  addBookmark: async (
    userUid: string,
    contentId: number,
    contentType: string = 'news'
  ): Promise<Bookmark> => {
    return await request<Bookmark>({
      url: API_ROUTES.engagement.bookmarks,
      method: 'POST',
      data: {
        user_uid: userUid,
        content_type: contentType,
        content_id: contentId,
      },
    });
  },

  /**
   * DELETE /engagement/bookmarks?content_type=news&content_id=xxx
   */
  removeBookmark: async (
    contentId: number,
    contentType: string = 'news'
  ): Promise<void> => {
    await request({
      url: API_ROUTES.engagement.bookmarks,
      method: 'DELETE',
      params: {
        content_type: contentType,
        content_id: contentId,
      },
    });
  },

  /**
   * DELETE /engagement/bookmarks/:id
   */
  deleteBookmarkById: async (bookmarkId: number): Promise<void> => {
    await request({
      url: API_ROUTES.engagement.bookmarkById(bookmarkId),
      method: 'DELETE',
    });
  },

  /**
   * GET /engagement/bookmarks/check?content_type=news&content_id=xxx
   */
  checkBookmark: async (
    contentId: number,
    contentType: string = 'news'
  ): Promise<BookmarkCheckResponse> => {
    return await request<BookmarkCheckResponse>({
      url: API_ROUTES.engagement.checkBookmark,
      method: 'GET',
      params: {
        content_type: contentType,
        content_id: contentId,
      },
    });
  },

  // ─── LIKES ──────────────────────────────────────────────────────────────

  like: async (newsUid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.like(newsUid), method: 'POST' });
  },

  unlike: async (newsUid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.like(newsUid), method: 'DELETE' });
  },

  // ─── VIEWS & SHARES ─────────────────────────────────────────────────────

  recordView: async (newsUid: string): Promise<void> => {
    await request({ url: API_ROUTES.news.view(newsUid), method: 'POST' });
  },

  recordShare: async (newsUid: string, platform?: string): Promise<void> => {
    await request({
      url: API_ROUTES.news.share(newsUid),
      method: 'POST',
      data: { platform },
    });
  },
};

export type { NewsComment, CreateCommentPayload } from './news';