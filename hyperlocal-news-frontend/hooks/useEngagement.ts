// hooks/useEngagement.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { engagementApi } from '@/services/api/engagement';
import { useAuthStore } from '@/store/authStore';

export const engagementKeys = {
  bookmarks: (type: string = 'news') =>
    ['engagement', 'bookmarks', type] as const,
  checkBookmark: (contentId: number | string, type: string = 'news') =>
    ['engagement', 'check-bookmark', type, contentId] as const,
};

/**
 * GET /engagement/bookmarks
 */
export function useBookmarks(contentType = 'news') {
  return useQuery({
    queryKey: engagementKeys.bookmarks(contentType),
    queryFn: () => engagementApi.getBookmarks(contentType),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * GET /engagement/bookmarks/check
 * Accepts string for backward compatibility - will convert to number internally
 */
export function useCheckBookmark(
  contentId: string | number | null,
  contentType = 'news'
) {
  return useQuery({
    queryKey: engagementKeys.checkBookmark(contentId!, contentType),
    queryFn: () => {
      if (!contentId) throw new Error('Content ID required');

      // TODO: Replace 0 with actual numeric ID once confirmed
      const numericId = typeof contentId === 'string' ? 0 : contentId;

      // Add null check
      if (numericId === 0) {
        // Return default response for string IDs until migration complete
        return Promise.resolve({ is_bookmarked: false });
      }

      return engagementApi.checkBookmark(numericId, contentType);
    },
    enabled: Boolean(contentId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * POST /engagement/bookmarks
 * Accepts string or number for contentId
 */
export function useAddBookmark() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (contentIdOrUid: string | number | { contentId: number; contentType?: string }) => {
      if (!user?.user_uid) throw new Error('Not authenticated');

      // Handle object format
      if (typeof contentIdOrUid === 'object') {
        return engagementApi.addBookmark(
          user.user_uid,
          contentIdOrUid.contentId,
          contentIdOrUid.contentType || 'news'
        );
      }

      // Handle string (news_uid) or number
      // TODO: Replace 0 with actual conversion once numeric ID field is confirmed
      const numericId = typeof contentIdOrUid === 'string' ? 0 : contentIdOrUid;
      return engagementApi.addBookmark(user.user_uid, numericId, 'news');
    },
    onMutate: async (contentIdOrUid) => {
      const contentId = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentId
        : contentIdOrUid;
      const contentType = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentType || 'news'
        : 'news';

      await queryClient.cancelQueries({
        queryKey: engagementKeys.bookmarks(contentType),
      });
      await queryClient.cancelQueries({
        queryKey: engagementKeys.checkBookmark(contentId, contentType),
      });

      const previousBookmarks = queryClient.getQueryData(
        engagementKeys.bookmarks(contentType)
      );
      const previousCheck = queryClient.getQueryData(
        engagementKeys.checkBookmark(contentId, contentType)
      );

      queryClient.setQueryData(
        engagementKeys.checkBookmark(contentId, contentType),
        { is_bookmarked: true }
      );

      return { previousBookmarks, previousCheck, contentId, contentType };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      if (context.previousBookmarks) {
        queryClient.setQueryData(
          engagementKeys.bookmarks(context.contentType),
          context.previousBookmarks
        );
      }
      if (context.previousCheck) {
        queryClient.setQueryData(
          engagementKeys.checkBookmark(context.contentId, context.contentType),
          context.previousCheck
        );
      }
    },
    onSuccess: (_data, contentIdOrUid) => {
      const contentType = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentType || 'news'
        : 'news';
      queryClient.invalidateQueries({
        queryKey: engagementKeys.bookmarks(contentType),
      });
    },
  });
}

/**
 * DELETE /engagement/bookmarks
 * Accepts string or number for contentId
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentIdOrUid: string | number | { contentId: number; contentType?: string }) => {
      // Handle object format
      if (typeof contentIdOrUid === 'object') {
        return engagementApi.removeBookmark(
          contentIdOrUid.contentId,
          contentIdOrUid.contentType || 'news'
        );
      }

      // Handle string or number
      // TODO: Replace 0 with actual conversion
      const numericId = typeof contentIdOrUid === 'string' ? 0 : contentIdOrUid;
      return engagementApi.removeBookmark(numericId, 'news');
    },
    onMutate: async (contentIdOrUid) => {
      const contentId = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentId
        : contentIdOrUid;
      const contentType = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentType || 'news'
        : 'news';

      await queryClient.cancelQueries({
        queryKey: engagementKeys.bookmarks(contentType),
      });
      await queryClient.cancelQueries({
        queryKey: engagementKeys.checkBookmark(contentId, contentType),
      });

      const previousBookmarks = queryClient.getQueryData(
        engagementKeys.bookmarks(contentType)
      );
      const previousCheck = queryClient.getQueryData(
        engagementKeys.checkBookmark(contentId, contentType)
      );

      queryClient.setQueryData(
        engagementKeys.checkBookmark(contentId, contentType),
        { is_bookmarked: false }
      );

      return { previousBookmarks, previousCheck, contentId, contentType };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      if (context.previousBookmarks) {
        queryClient.setQueryData(
          engagementKeys.bookmarks(context.contentType),
          context.previousBookmarks
        );
      }
      if (context.previousCheck) {
        queryClient.setQueryData(
          engagementKeys.checkBookmark(context.contentId, context.contentType),
          context.previousCheck
        );
      }
    },
    onSuccess: (_data, contentIdOrUid) => {
      const contentType = typeof contentIdOrUid === 'object'
        ? contentIdOrUid.contentType || 'news'
        : 'news';
      queryClient.invalidateQueries({
        queryKey: engagementKeys.bookmarks(contentType),
      });
    },
  });
}

export function useLike() {
  return useMutation({
    mutationFn: (newsUid: string) => engagementApi.like(newsUid),
  });
}

export function useUnlike() {
  return useMutation({
    mutationFn: (newsUid: string) => engagementApi.unlike(newsUid),
  });
}

export function useRecordView() {
  return useMutation({
    mutationFn: (newsUid: string) => engagementApi.recordView(newsUid),
  });
}

export function useRecordShare() {
  return useMutation({
    mutationFn: ({
      newsUid,
      platform,
    }: {
      newsUid: string;
      platform?: string;
    }) => engagementApi.recordShare(newsUid, platform),
  });
}