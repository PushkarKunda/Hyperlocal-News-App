// hooks/useNews.ts
import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { newsApi } from '@/services/api';
import type { NewsArticle, NewsFilters, CreateNewsPayload, UpdateNewsPayload, SearchNewsParams } from '@/services/api/news';
import { useCategoriesList } from './useApi';

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

const queryKeys = {
  news: {
    all: ['news'] as const,
    feed: (filters?: NewsFilters) => ['news', 'feed', filters] as const,
    byCategory: (categorySlug: string | undefined, categoryId: number | undefined) =>
      ['news', 'by-category', categorySlug, categoryId] as const,
    byId: (uid: string | undefined) => ['news', 'article', uid] as const,
    byLocation: (location: any) => ['news', 'by-location', location] as const,
    breaking: ['news', 'breaking'] as const,
    trending: ['news', 'trending'] as const,
    popular: ['news', 'popular'] as const,
    shorts: ['news', 'shorts'] as const,
    related: (uid: string | undefined) => ['news', 'related', uid] as const,
    search: (params: SearchNewsParams) => ['news', 'search', params] as const,
    engagement: (uid: string | undefined) => ['news', 'engagement', uid] as const,
    comments: (uid: string | undefined) => ['news', 'comments', uid] as const,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const useMergedNews = (newsArray: NewsArticle[] | undefined): NewsArticle[] => {
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  return useMemo(() => {
    if (!newsArray) return [];
    return newsArray.map((article) => ({
      ...article,
      isBookmarked: bookmarkedArticleIds.includes(article.news_uid),
    }));
  }, [newsArray, bookmarkedArticleIds]);
};

// ═══════════════════════════════════════════════════════════════════════════
// getFeed
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsFeed(filters?: NewsFilters) {
  return useQuery({
    queryKey: queryKeys.news.feed(filters),
    queryFn: () => newsApi.getFeed(filters),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// getById
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsArticle(uid: string | undefined) {
  const bookmarkedArticleIds = useStore((state) => state.bookmarkedArticleIds);

  const query = useQuery({
    queryKey: queryKeys.news.byId(uid),
    queryFn: async () => {
      if (!uid) throw new Error('Article UID required');
      return newsApi.getById(uid);
    },
    enabled: Boolean(uid),
    staleTime: 1000 * 60 * 5,
  });

  const article = useMemo(() => {
    if (!query.data) return undefined;
    return {
      ...query.data,
      isBookmarked: bookmarkedArticleIds.includes(query.data.news_uid),
    };
  }, [query.data, bookmarkedArticleIds]);

  return {
    ...query,
    data: article,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// create
// ═══════════════════════════════════════════════════════════════════════════

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNewsPayload) => newsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.feed() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// update
// ═══════════════════════════════════════════════════════════════════════════

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: UpdateNewsPayload }) =>
      newsApi.update(uid, payload),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.feed() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// delete
// ═══════════════════════════════════════════════════════════════════════════

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => newsApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.feed() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// getBreaking
// ═══════════════════════════════════════════════════════════════════════════

export function useBreakingNews() {
  const query = useQuery({
    queryKey: queryKeys.news.breaking,
    queryFn: () => newsApi.getBreaking(),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getPopular
// ═══════════════════════════════════════════════════════════════════════════

export function usePopularNews() {
  const query = useQuery({
    queryKey: queryKeys.news.popular,
    queryFn: () => newsApi.getPopular(),
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getTrending
// ═══════════════════════════════════════════════════════════════════════════

export function useTrendingNews() {
  const query = useQuery({
    queryKey: queryKeys.news.trending,
    queryFn: () => newsApi.getTrending(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getByLocation
// ═══════════════════════════════════════════════════════════════════════════

export function useLocationNews(location?: {
  latitude?: number;
  longitude?: number;
  radius?: number;
  city?: string;
  district?: string;
  state?: string;
}) {
  const query = useQuery({
    queryKey: queryKeys.news.byLocation(location),
    queryFn: () => newsApi.getByLocation(location || {}),
    enabled: Boolean(location && (location.state || location.latitude)),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getByCategory
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsByCategory(categoryId: number) {
  const query = useQuery({
    queryKey: queryKeys.news.byCategory(String(categoryId), categoryId),
    queryFn: () => newsApi.getByCategory(categoryId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getRelated
// ═══════════════════════════════════════════════════════════════════════════

export function useRelatedNews(uid: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.news.related(uid),
    queryFn: () => {
      if (!uid) throw new Error('Article UID required');
      return newsApi.getRelated(uid);
    },
    enabled: Boolean(uid),
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// search
// ═══════════════════════════════════════════════════════════════════════════

export function useSearchNews(params: SearchNewsParams) {
  const query = useQuery({
    queryKey: queryKeys.news.search(params),
    queryFn: () => newsApi.search(params),
    enabled: params.query.length > 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getShorts
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsShorts() {
  const query = useQuery({
    queryKey: queryKeys.news.shorts,
    queryFn: () => newsApi.getShorts(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    data: useMergedNews(query.data),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// getEngagement
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsEngagement(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.news.engagement(uid),
    queryFn: () => {
      if (!uid) throw new Error('Article UID required');
      return newsApi.getEngagement(uid);
    },
    enabled: Boolean(uid),
    staleTime: 1000 * 60 * 2,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// like
// ═══════════════════════════════════════════════════════════════════════════

export function useLikeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => newsApi.like(uid),
    onMutate: async (uid) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.news.byId(uid) });

      const previousArticle = queryClient.getQueryData(queryKeys.news.byId(uid));

      queryClient.setQueryData(queryKeys.news.byId(uid), (old: any) => {
        if (!old) return old;
        return { ...old, likes: old.likes + 1 };
      });

      return { previousArticle };
    },
    onError: (err, uid, context) => {
      if (context?.previousArticle) {
        queryClient.setQueryData(queryKeys.news.byId(uid), context.previousArticle);
      }
    },
    onSuccess: (_, uid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.engagement(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.feed() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// unlike
// ═══════════════════════════════════════════════════════════════════════════

export function useUnlikeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => newsApi.unlike(uid),
    onMutate: async (uid) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.news.byId(uid) });

      const previousArticle = queryClient.getQueryData(queryKeys.news.byId(uid));

      queryClient.setQueryData(queryKeys.news.byId(uid), (old: any) => {
        if (!old) return old;
        return { ...old, likes: Math.max(0, old.likes - 1) };
      });

      return { previousArticle };
    },
    onError: (err, uid, context) => {
      if (context?.previousArticle) {
        queryClient.setQueryData(queryKeys.news.byId(uid), context.previousArticle);
      }
    },
    onSuccess: (_, uid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.engagement(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.feed() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// recordView
// ═══════════════════════════════════════════════════════════════════════════

export function useRecordView() {
  return useMutation({
    mutationFn: (uid: string) => newsApi.recordView(uid),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// recordShare
// ═══════════════════════════════════════════════════════════════════════════

export function useRecordShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, platform }: { uid: string; platform?: string }) =>
      newsApi.recordShare(uid, platform),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.engagement(uid) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// getComments
// ═══════════════════════════════════════════════════════════════════════════

export function useNewsComments(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.news.comments(uid),
    queryFn: () => {
      if (!uid) throw new Error('Article UID required');
      return newsApi.getComments(uid);
    },
    enabled: Boolean(uid),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 45,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// addComment
// ═══════════════════════════════════════════════════════════════════════════

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, text }: { uid: string; text: string }) =>
      newsApi.addComment(uid, { comment_text: text }),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.comments(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.engagement(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// deleteComment
// ═══════════════════════════════════════════════════════════════════════════

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, commentId }: { uid: string; commentId: number }) =>
      newsApi.deleteComment(uid, commentId),
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.comments(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.engagement(uid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.byId(uid) });
    },
  });
}