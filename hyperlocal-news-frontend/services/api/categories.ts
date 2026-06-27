// services/api/categories.ts
import { API_ROUTES } from './routes';
import { request } from './client';

// ✅ Types defined inline - no external import needed
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  news_count?: number;
  description?: string | null;
}

// ✅ Backend response type
interface CategoryResponse {
  id: number;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  color: string | null;
  description: string | null;
  news_count: number;
}

// ✅ Helper to create slug
const toSlug = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, '-');

// ✅ Map backend response to app type
const mapCategory = (category: CategoryResponse): Category => ({
  id: String(category.id),
  name: category.name,
  slug: toSlug(category.name),
  icon: category.image_url ?? undefined,
  color: category.color ?? undefined,
  display_order: category.display_order,
  is_active: category.is_active,
  news_count: category.news_count,
  description: category.description ?? undefined,
});

// ✅ API
export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await request<CategoryResponse[]>({
      url: API_ROUTES.categories.all,
      method: 'GET',
    });
    return response.map(mapCategory);
  },
};