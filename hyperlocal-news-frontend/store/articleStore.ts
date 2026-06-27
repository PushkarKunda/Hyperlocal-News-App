// store/useArticleStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ArticleItem {
  id: string;
  category: string;
  headline: string;
  summary: string;
  sourceName: string;
  publishedAt: string;
  views: string;
  likes: string;
  readingTime: string;
  imageUrl: string;
  content?: string;
  language?: string;
  location?: string;
  tags?: string[];
}

interface ArticleState {
  articles: ArticleItem[];
  addArticle: (
    article: Omit<ArticleItem, 'id' | 'views' | 'likes' | 'publishedAt'>
  ) => void;
  deleteArticle: (id: string) => void;
  clearArticles: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useArticleStore = create<ArticleState>()(
  persist(
    (set) => ({
      // ✅ Start with empty array - no mock data
      articles: [],

      addArticle: (newArticle) =>
        set((state) => ({
          articles: [
            {
              ...newArticle,
              id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              views: '0',
              likes: '0',
              publishedAt: new Date().toISOString(),
            },
            ...state.articles,
          ],
        })),

      deleteArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        })),

      clearArticles: () => set({ articles: [] }),
    }),
    {
      name: 'article-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);