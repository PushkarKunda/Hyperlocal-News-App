import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';

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

const fetchNewsFromStore = async (
  allArticles: NewsArticle[],
  categorySlug?: string
): Promise<NewsArticle[]> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const published = allArticles.filter((a) => a.status === 'published');
  
  // "For You" logic: In a real app, this would be a personalized recommendation.
  // Here we return all published articles, sorted by date (if date existed, but mockNews is randomized)
  if (!categorySlug || categorySlug === 'for-you') return published;
  
  return published.filter((a) => a.category.slug === categorySlug);
};

// ─── Public-facing feed ───────────────────────────────────────────────────────

export const useNews = (categorySlug?: string) => {
  // We include allArticles in the queryKey to ensure reactivity when the store updates
  const allArticles = useStore((state) => state.allArticles);

  const query = useQuery({
    queryKey: ['news', categorySlug, allArticles.length], // Reactive to article count
    queryFn: () => fetchNewsFromStore(allArticles, categorySlug),
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
        queryKey: ['news', categorySlug, allArticles.length],
        queryFn: () => fetchNewsFromStore(allArticles, categorySlug),
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

  const article = useMemo(() => {
    const found = allArticles.find((a) => a.id === id);
    if (!found) return undefined;
    return { ...found, isBookmarked: bookmarkedArticleIds.includes(found.id) };
  }, [allArticles, bookmarkedArticleIds, id]);

  return {
    data: article,
    isLoading: false,
  };
};

// ─── Publisher's own articles ─────────────────────────────────────────────────

export const usePublisherArticles = () => {
  const allArticles = useStore((state) => state.allArticles);
  const user = useStore((state) => state.user);

  const myArticles = useMemo(
    () => allArticles.filter((a) => a.publisherId === user.id),
    [allArticles, user.id]
  );

  const pending = useMemo(() => myArticles.filter((a) => a.status === 'pending'), [myArticles]);
  const published = useMemo(() => myArticles.filter((a) => a.status === 'published'), [myArticles]);
  const rejected = useMemo(() => myArticles.filter((a) => a.status === 'rejected'), [myArticles]);

  return { all: myArticles, pending, published, rejected, isLoading: false };
};
