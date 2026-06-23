import { Category } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';
interface GeneratedCategoryOut {
  id: number | string;
  name: string;
  image_url?: string | null;
  color?: string | null;
}

const toSlug = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

const mapCategory = (category: GeneratedCategoryOut): Category => ({
  id: String(category.id),
  name: category.name,
  slug: toSlug(category.name),
  icon: category.image_url ?? undefined,
  color: category.color ?? undefined,
});

export const categoriesApi = {
  list: async () => {
    const response = await request<GeneratedCategoryOut[]>({ url: API_ROUTES.categories.all, method: 'GET' });
    return response.map(mapCategory);
  },
};
