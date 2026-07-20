// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, type Post, type PostComment } from '@/services/api/posts';

export const postKeys = {
  all: ['posts'] as const,
  feed: (cursor?: string | null) => ['posts', 'feed', cursor] as const,
  single: (postUid: string) => ['posts', 'single', postUid] as const,
  comments: (postUid: string) => ['posts', 'comments', postUid] as const,
  userPosts: (userUid: string) => ['posts', 'user', userUid] as const,
};

/**
 * Hook to fetch public posts feed
 */
export function usePublicPostsFeed(limit = 20, cursor: string | null = null) {
  return useQuery({
    queryKey: postKeys.feed(cursor),
    queryFn: () => postsApi.getPublicFeed(limit, cursor),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch comments for a post
 */
export function usePostComments(postUid: string | null) {
  return useQuery({
    queryKey: postKeys.comments(postUid!),
    queryFn: () => postsApi.getComments(postUid!),
    enabled: Boolean(postUid),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to toggle like on a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postUid: string) => postsApi.likePost(postUid),
    onSuccess: (data, postUid) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to add a comment to a post
 */
export function useAddPostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postUid, commentText }: { postUid: string; commentText: string }) =>
      postsApi.addComment(postUid, commentText),
    onSuccess: (_, { postUid }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postUid) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to share a post
 */
export function useSharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postUid, platform }: { postUid: string; platform?: string }) =>
      postsApi.sharePost(postUid, platform || 'native'),
    onSuccess: (_, { postUid }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string | null; image_url?: string | null; video_url?: string | null }) =>
      postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
