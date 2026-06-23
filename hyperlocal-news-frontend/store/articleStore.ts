import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const INITIAL_ARTICLES: ArticleItem[] = [];

interface ArticleState {
  articles: ArticleItem[];
  addArticle: (article: Omit<ArticleItem, 'id' | 'views' | 'likes' | 'publishedAt'>) => void;
  deleteArticle: (id: string) => void;
  clearArticles: () => void;
  resetArticles: () => void;
}

export const useArticleStore = create<ArticleState>()(
  persist(
    (set) => ({
      articles: INITIAL_ARTICLES,
      
      addArticle: (newArticle) => set((state) => ({
        articles: [
          {
            ...newArticle,
            id: Math.random().toString(36).substr(2, 9),
            views: '0 views',
            likes: '0',
            publishedAt: 'Just now',
          },
          ...state.articles,
        ],
      })),

      deleteArticle: (id) => set((state) => ({
        articles: state.articles.filter((a) => a.id !== id),
      })),

      clearArticles: () => set({ articles: [] }),
      
      resetArticles: () => set({ articles: INITIAL_ARTICLES }),
    }),
    {
      name: 'article-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
