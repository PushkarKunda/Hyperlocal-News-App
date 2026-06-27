import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';
import { API_CONFIG, categoriesApi, newsApi, usersApi, mapNewsArticle } from '@/services/api';

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

// ─── Public-facing feed ───────────────────────────────────────────────────────

export const useNews = (categorySlug?: string) => {
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'api'],
    queryFn: () => categoriesApi.list(),
    staleTime: 1000 * 60 * 30,
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
    queryKey: ['news', categorySlug, resolvedCategoryId ?? 'all', 'api'],
    queryFn: async () => {
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

  const prefetch = useCallback(
    async (categorySlug: string) => {
      const categories = await queryClient.fetchQuery({
        queryKey: ['categories', 'api'],
        queryFn: () => categoriesApi.list(),
        staleTime: 1000 * 60 * 30,
      });

      const matchedCategory = categories?.find(
        (category) => category.slug === categorySlug || category.name.toLowerCase() === categorySlug.toLowerCase()
      );
      const parsedId = matchedCategory ? Number(matchedCategory.id) : Number.NaN;
      const resolvedCategoryId = Number.isFinite(parsedId) ? parsedId : undefined;

      queryClient.prefetchQuery({
        queryKey: ['news', categorySlug, resolvedCategoryId ?? 'all', 'api'],
        queryFn: () => {
          if (!resolvedCategoryId) {
            return newsApi.list();
          }
          return newsApi.listByCategory(resolvedCategoryId);
        },
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
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
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  const query = useQuery({
    queryKey: ['news-article', id, 'api'],
    queryFn: async () => {
      return newsApi.getById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });

  const article = useMemo(() => {
    const found = query.data;
    if (!found) return undefined;
    return { ...found, isBookmarked: bookmarkedArticleIds.includes(found.id) };
  }, [bookmarkedArticleIds, query.data]);

  return {
    data: article,
    isLoading: query.isLoading,
  };
};

// ─── Publisher's own articles ─────────────────────────────────────────────────

export const usePublisherArticles = () => {
  const query = useQuery({
    queryKey: ['publisher-dashboard', 'api'],
    queryFn: () => usersApi.dashboard({ detailed: true, limit: 100 }),
  });

  const myArticles: NewsArticle[] = useMemo(() => {
    const data = query.data;
    if (!data) return [];
    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if ((data as any).detailed_news?.items) {
      items = (data as any).detailed_news.items;
    } else if ((data as any).recent_news?.items) {
      items = (data as any).recent_news.items;
    } else {
      items = (data as any).items || (data as any).articles || [];
    }
    return items.map((item: any) => mapNewsArticle(item));
  }, [query.data]);

  const pending = useMemo(() => myArticles.filter((a: NewsArticle) => a.status === 'pending'), [myArticles]);
  const published = useMemo(() => myArticles.filter((a: NewsArticle) => a.status === 'published'), [myArticles]);
  const rejected = useMemo(() => myArticles.filter((a: NewsArticle) => a.status === 'rejected'), [myArticles]);

  return { 
    all: myArticles, 
    pending, 
    published, 
    rejected, 
    isLoading: query.isLoading,
    refetch: query.refetch,
    dashboard: query.data as any
  };
};

// ─── Create news article ──────────────────────────────────────────────────────

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      headline: string;
      summary: string;
      content: string;
      category: string;
      sourceName?: string;
      imageUrl?: string;
      language?: string;
      location?: string;
      tags?: string[];
    }) => newsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'api'] });
      queryClient.invalidateQueries({ queryKey: ['publisher-dashboard', 'api'] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => newsApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'api'] });
      queryClient.invalidateQueries({ queryKey: ['publisher-dashboard', 'api'] });
    },
  });
};

export const useLocationNews = (location?: { state?: string; district?: string; city?: string }) => {
  const query = useQuery({
    queryKey: ['news-location', location, 'api'],
    queryFn: () => newsApi.listByLocation(location),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: query.data,
  };
};
