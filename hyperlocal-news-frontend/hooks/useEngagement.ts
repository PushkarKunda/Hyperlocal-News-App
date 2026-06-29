// hooks/useEngagement.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { engagementApi } from '@/services/api';
import type { CreateCommentPayload } from '@/services/api/engagement';

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

const queryKeys = {
  bookmarks: ['engagement', 'bookmarks'] as const,
  checkBookmark: (uid: string) => ['engagement', 'check-bookmark', uid] as const,
  stats: (uid: string | undefined) => ['engagement', 'stats', uid] as const,
  summary: (uid: string | undefined) => ['engagement', 'summary', uid] as const,
  comments: (uid: string | undefined) => ['engagement', 'comments', uid] as const,
};

// ═══════════════════════════════════════════════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getBookmarks
 * GET /engagement/bookmarks
 */
export function useBookmarks() {
  return useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: () => engagementApi.getBookmarks(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * checkBookmark
 * GET /engagement/bookmarks/check?news_uid=xxx
 */
export function useCheckBookmark(contentUid: string) {
  return useQuery({
    queryKey: queryKeys.checkBookmark(contentUid),
    queryFn: () => engagementApi.checkBookmark(contentUid),
    enabled: Boolean(contentUid),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * addBookmark
 * POST /engagement/bookmarks
 */
export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentUid: string) => engagementApi.addBookmark(contentUid),
    onMutate: async (contentUid) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks });
      await queryClient.cancelQueries({
        queryKey: queryKeys.checkBookmark(contentUid),
      });

      // Snapshot previous values
      const previousBookmarks = queryClient.getQueryData(queryKeys.bookmarks);
      const previousCheck = queryClient.getQueryData(
        queryKeys.checkBookmark(contentUid)
      );

      // Optimistically update check
      queryClient.setQueryData(queryKeys.checkBookmark(contentUid), {
        is_bookmarked: true,
      });

      return { previousBookmarks, previousCheck };
    },
    onError: (err, contentUid, context) => {
      // Rollback on error
      if (context?.previousBookmarks) {
        queryClient.setQueryData(queryKeys.bookmarks, context.previousBookmarks);
      }
      if (context?.previousCheck) {
        queryClient.setQueryData(
          queryKeys.checkBookmark(contentUid),
          context.previousCheck
        );
      }
    },
    onSuccess: () => {
      // Refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
    },
  });
}

/**
 * removeBookmark
 * DELETE /engagement/bookmarks
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentUid: string) => engagementApi.removeBookmark(contentUid),
    onMutate: async (contentUid) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks });
      await queryClient.cancelQueries({
        queryKey: queryKeys.checkBookmark(contentUid),
      });

      // Snapshot previous values
      const previousBookmarks = queryClient.getQueryData(queryKeys.bookmarks);
      const previousCheck = queryClient.getQueryData(
        queryKeys.checkBookmark(contentUid)
      );

      // Optimistically update check
      queryClient.setQueryData(queryKeys.checkBookmark(contentUid), {
        is_bookmarked: false,
      });

      return { previousBookmarks, previousCheck };
    },
    onError: (err, contentUid, context) => {
      // Rollback on error
      if (context?.previousBookmarks) {
        queryClient.setQueryData(queryKeys.bookmarks, context.previousBookmarks);
      }
      if (context?.previousCheck) {
        queryClient.setQueryData(
          queryKeys.checkBookmark(contentUid),
          context.previousCheck
        );
      }
    },
    onSuccess: () => {
      // Refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
    },
  });
}

/**
 * deleteBookmarkById
 * DELETE /engagement/bookmarks/:id
 */
export function useDeleteBookmarkById() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: number) => engagementApi.deleteBookmarkById(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// LIKES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * like
 * POST /news/v1/user/news/:uid/like
 */
export function useLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentUid: string) => engagementApi.like(contentUid),
    onSuccess: (_, contentUid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary(contentUid) });
    },
  });
}

/**
 * unlike
 * DELETE /news/v1/user/news/:uid/like
 */
export function useUnlike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentUid: string) => engagementApi.unlike(contentUid),
    onSuccess: (_, contentUid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary(contentUid) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * recordView
 * POST /news/v1/user/news/:uid/view
 */
export function useRecordView() {
  return useMutation({
    mutationFn: (contentUid: string) => engagementApi.recordView(contentUid),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * recordShare
 * POST /news/v1/user/news/:uid/share
 */
export function useRecordShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentUid,
      platform,
    }: {
      contentUid: string;
      platform?: string;
    }) => engagementApi.recordShare(contentUid, platform),
    onSuccess: (_, { contentUid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary(contentUid) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getComments
 * GET /news/v1/news/:uid/comments
 */
export function useComments(contentUid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments(contentUid),
    queryFn: () => {
      if (!contentUid) throw new Error('Content UID required');
      return engagementApi.getComments(contentUid);
    },
    enabled: Boolean(contentUid),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 45,
  });
}

/**
 * addComment
 * POST /news/v1/user/news/:uid/comment
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentUid,
      payload,
    }: {
      contentUid: string;
      payload: CreateCommentPayload;
    }) => engagementApi.addComment(contentUid, payload),
    onSuccess: (_, { contentUid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary(contentUid) });
    },
  });
}

/**
 * deleteComment
 * DELETE /news/v1/user/news/:uid/comment/:id
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentUid,
      commentId,
    }: {
      contentUid: string;
      commentId: number;
    }) => engagementApi.deleteComment(contentUid, commentId),
    onSuccess: (_, { contentUid }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(contentUid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary(contentUid) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGAGEMENT STATS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * getStats
 * GET /news/v1/news/:uid/engagement
 */
export function useEngagementStats(contentUid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stats(contentUid),
    queryFn: () => {
      if (!contentUid) throw new Error('Content UID required');
      return engagementApi.getStats(contentUid);
    },
    enabled: Boolean(contentUid),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * getSummary
 * GET /engagement/summary/:uid
 */
export function useEngagementSummary(contentUid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.summary(contentUid),
    queryFn: () => {
      if (!contentUid) throw new Error('Content UID required');
      return engagementApi.getSummary(contentUid);
    },
    enabled: Boolean(contentUid),
    staleTime: 1000 * 60 * 5,
  });
}