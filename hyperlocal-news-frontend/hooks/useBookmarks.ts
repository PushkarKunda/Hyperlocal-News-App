import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '@/services/api/bookmarks';

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks', 'api'],
    queryFn: () => bookmarksApi.list(),
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: string) => bookmarksApi.add(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'api'] });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => bookmarksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'api'] });
    },
  });
};
