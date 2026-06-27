import { useQuery } from '@tanstack/react-query';

import { categoriesApi } from '@/services/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories', 'api'],
    queryFn: () => categoriesApi.list(),
    staleTime: 1000 * 60 * 30, // categories rarely change — cache 30 min
  });
};
