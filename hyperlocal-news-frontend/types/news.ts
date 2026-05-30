export type ArticleStatus = 'pending' | 'published' | 'rejected';

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  content?: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  category: Category;
  source: NewsSource;
  author?: Author;
  location: ArticleLocation;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  url: string;
  isBreaking?: boolean;
  isBookmarked?: boolean;
  stats: ArticleStats;
  tags?: string[];
  /** Article lifecycle status — added by publisher, verified by admin */
  status: ArticleStatus;
  /** ID of the publisher who submitted the article (undefined for legacy/imported articles) */
  publisherId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  logo?: string;
  isVerified?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface ArticleLocation {
  state?: string;
  district?: string;
  city?: string;
}

export interface ArticleStats {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  bookmarks: number;
}

export interface NewsFeedResponse {
  success: boolean;
  data: NewsArticle[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NewsFilters {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'latest' | 'popular' | 'trending';
}

export interface BookmarkRequest {
  articleId: string;
}

export interface BookmarkResponse {
  success: boolean;
  isBookmarked: boolean;
  message: string;
}

export interface LikeRequest {
  articleId: string;
}

export interface LikeResponse {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
  message: string;
}