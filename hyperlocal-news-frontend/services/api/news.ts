import { NewsArticle, NewsFilters } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';
interface GeneratedNewsOut {
  [key: string]: any;
  news_uid?: string;
  id?: string;
  user_uid?: string;
  summary?: string;
  image_url?: string | null;
  category?: any;
  source_name?: string;
  title?: string;
  state?: any;
  district?: any;
  city?: any;
  created_at?: string;
}

const DEFAULT_CATEGORY = {
  id: 'news',
  name: 'News',
  slug: 'news',
  color: '#4648D4',
};

const DEFAULT_SOURCE = {
  id: 'api',
  name: 'API',
  isVerified: true,
};

const extractText = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'name' in value && typeof (value as { name?: unknown }).name === 'string') {
    return (value as { name: string }).name;
  }
  return undefined;
};

const mapNewsArticle = (article: Partial<GeneratedNewsOut> & Record<string, unknown>): NewsArticle => {
  const id = String(article.news_uid ?? article.id ?? article.user_uid ?? `news-${Date.now()}`);
  const summary = typeof article.summary === 'string' ? article.summary : '';
  const imageUrl = typeof article.image_url === 'string' && article.image_url ? article.image_url : 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200';
  const categoryName = extractText(article.category) ?? DEFAULT_CATEGORY.name;
  const sourceName = typeof article.source_name === 'string' && article.source_name ? article.source_name : DEFAULT_SOURCE.name;

  return {
    id,
    headline: typeof article.title === 'string' ? article.title : 'Untitled article',
    summary,
    content: typeof (article as { content?: unknown }).content === 'string' ? (article as { content: string }).content : undefined,
    imageUrl,
    images: undefined,
    videoUrl: undefined,
    category: { ...DEFAULT_CATEGORY, name: categoryName },
    source: {
      ...DEFAULT_SOURCE,
      name: sourceName,
    },
    author: {
      id: String(article.user_uid ?? 'author'),
      name: sourceName,
    },
    location: {
      state: extractText(article.state),
      district: extractText(article.district),
      city: extractText(article.city),
    },
    publishedAt: typeof article.created_at === 'string' ? article.created_at : new Date().toISOString(),
    updatedAt: undefined,
    readTime: '5 min read',
    url: `https://hyperlocal.app/news/${id}`,
    isBreaking: false,
    isBookmarked: false,
    stats: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      bookmarks: 0,
    },
    tags: undefined,
    status: 'published',
    publisherId: article.user_uid,
  };
};

const pickList = (data: unknown): GeneratedNewsOut[] => {
  if (Array.isArray(data)) return data as GeneratedNewsOut[];

  if (data && typeof data === 'object') {
    const record = data as { items?: unknown; data?: unknown; results?: unknown };
    if (Array.isArray(record.items)) return record.items as GeneratedNewsOut[];
    if (Array.isArray(record.data)) return record.data as GeneratedNewsOut[];
    if (Array.isArray(record.results)) return record.results as GeneratedNewsOut[];
  }

  return [];
};

export const newsApi = {
  list: async (filters?: NewsFilters) => {
    const response = await request<unknown>({
      url: API_ROUTES.news,
      method: 'GET',
      params: filters,
    });

    return pickList(response.data).map(mapNewsArticle);
  },

  listByCategory: async (categoryId: number) => {
    const response = await request<unknown>({
      url: API_ROUTES.newsByCategory(categoryId),
      method: 'GET',
    });

    return pickList(response.data).map(mapNewsArticle);
  },

  getById: async (id: string) => {
    const response = await request<unknown>({
      url: API_ROUTES.newsById(id),
      method: 'GET',
    });

    const raw = Array.isArray(response.data) ? response.data[0] : (response.data as GeneratedNewsOut | undefined);
    if (!raw) return undefined;
    return mapNewsArticle(raw as Partial<GeneratedNewsOut> & Record<string, unknown>);
  },
};
