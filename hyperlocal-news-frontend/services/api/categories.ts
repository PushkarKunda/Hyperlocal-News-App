import { Category } from '@/types';
import { API_ROUTES } from './routes';
import { request } from './client';
import type { components } from '../../../types/generated-api';

type GeneratedCategoryOut = components['schemas']['CategoryOut'];

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
    const response = await request<GeneratedCategoryOut[]>({ url: API_ROUTES.categories, method: 'GET' });
    return response.data.map(mapCategory);
  },
};
