import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';
import { API_CONFIG, categoriesApi, newsApi } from '@/services/api';

// ─── Helper: merge live bookmark state into articles ──────────────────────────

const useMergedNews = (newsArray: NewsArticle[] | undefined): NewsArticle[] => {
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  return useMemo(() => {
    if (!newsArray) return [];
    return newsArray.map((article) => ({
      ...article,
      isBookmarked: bookmarkedArticleIds.includes(article.id),
    }));
  }, [newsArray, bookmarkedArticleIds]);
};

// ─── API Simulation Layer (Future Supabase Integration Point) ────────────────

const fetchNews = async (
  allArticles: NewsArticle[],
  categorySlug?: string
): Promise<NewsArticle[]> => {
  if (API_CONFIG.useMocks) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const published = allArticles.filter((a) => a.status === 'published');

    if (!categorySlug || categorySlug === 'for-you') return published;

    return published.filter((a) => a.category.slug === categorySlug);
  }

  return newsApi.list(categorySlug ? { category: categorySlug } : undefined);
};

// ─── Public-facing feed ───────────────────────────────────────────────────────

export const useNews = (categorySlug?: string) => {
  // We include allArticles in the queryKey to ensure reactivity when the store updates
  const allArticles = useStore((state) => state.allArticles);
  const categoriesQuery = useQuery({
    queryKey: ['categories', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: () => categoriesApi.list(),
    staleTime: 1000 * 60 * 30,
    enabled: !API_CONFIG.useMocks,
  });
  const resolvedCategoryId = useMemo(() => {
    if (!categorySlug || categorySlug === 'for-you') return undefined;

    const matchedCategory = categoriesQuery.data?.find(
      (category) => category.slug === categorySlug || category.name.toLowerCase() === categorySlug.toLowerCase()
    );

    const parsedId = matchedCategory ? Number(matchedCategory.id) : Number.NaN;
    return Number.isFinite(parsedId) ? parsedId : undefined;
  }, [categorySlug, categoriesQuery.data]);

  const query = useQuery({
    queryKey: ['news', categorySlug, resolvedCategoryId ?? 'all', allArticles.length, API_CONFIG.useMocks ? 'mock' : 'api'], // Reactive to article count
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        return fetchNews(allArticles, categorySlug);
      }

      if (!resolvedCategoryId) {
        return newsApi.list();
      }

      return newsApi.listByCategory(resolvedCategoryId);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
};

// ─── Prefetching Logic ────────────────────────────────────────────────────────

export const usePrefetchNews = () => {
  const queryClient = useQueryClient();
  const allArticles = useStore((state) => state.allArticles);

  const prefetch = useCallback(
    (categorySlug: string) => {
      queryClient.prefetchQuery({
        queryKey: ['news', categorySlug, allArticles.length, API_CONFIG.useMocks ? 'mock' : 'api'],
        queryFn: () => fetchNews(allArticles, categorySlug),
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient, allArticles]
  );

  return prefetch;
};

// ─── Bookmarked articles ──────────────────────────────────────────────────────

export const useBookmarkedNews = () => {
  const allArticles = useStore((state) => state.allArticles);
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  const bookmarked = useMemo(
    () =>
      allArticles
        .filter((a) => bookmarkedArticleIds.includes(a.id))
        .map((a) => ({ ...a, isBookmarked: true })),
    [allArticles, bookmarkedArticleIds]
  );

  return {
    data: bookmarked,
    isLoading: false,
  };
};

// ─── Single article by id ─────────────────────────────────────────────────────

export const useNewsArticle = (id: string) => {
  const allArticles = useStore((state) => state.allArticles);
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  const query = useQuery({
    queryKey: ['news-article', id, API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        return allArticles.find((article) => article.id === id);
      }

      return newsApi.getById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

  const article = useMemo(() => {
    const found = query.data ?? allArticles.find((a) => a.id === id);
    if (!found) return undefined;
    return { ...found, isBookmarked: bookmarkedArticleIds.includes(found.id) };
  }, [allArticles, bookmarkedArticleIds, id, query.data]);

  return {
    data: article,
    isLoading: query.isLoading,
  };
};

// ─── Publisher's own articles ─────────────────────────────────────────────────

export const usePublisherArticles = () => {
  const allArticles = useStore((state) => state.allArticles);
  const user = useStore((state) => state.user);

  const myArticles = useMemo(
    () => allArticles.filter((a) => a.publisherId === user?.id),
    [allArticles, user?.id]
  );

  const pending = useMemo(() => myArticles.filter((a) => a.status === 'pending'), [myArticles]);
  const published = useMemo(() => myArticles.filter((a) => a.status === 'published'), [myArticles]);
  const rejected = useMemo(() => myArticles.filter((a) => a.status === 'rejected'), [myArticles]);

  return { all: myArticles, pending, published, rejected, isLoading: false };
};
