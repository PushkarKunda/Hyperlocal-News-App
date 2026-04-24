import { useQuery } from '@tanstack/react-query';
import { MOCK_CATEGORIES } from '@/data';
import { Category } from '@/types';

// ── Swap this function body with a real API call when backend is ready ──
const fetchCategories = async (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_CATEGORIES), 300);
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // categories rarely change — cache 30 min
  });
};
