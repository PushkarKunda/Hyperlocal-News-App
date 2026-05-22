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
}

export const INITIAL_ARTICLES: ArticleItem[] = [
  {
    id: '1',
    category: 'BUSINESS',
    headline: 'Historic Funding: Kukatpally Tech Startups Raise $500M',
    summary: "In a historic week for the local ecosystem, three homegrown tech startups have announced massive funding rounds. Investors cite the city's growing talent pool and favorable regulatory environment as primary drivers...",
    sourceName: 'Times of Kukatpally',
    publishedAt: '2h ago',
    views: '3.4k views',
    likes: '1.2k',
    readingTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  },
  {
    id: '2',
    category: 'ENVIRONMENT',
    headline: 'Lake Beautification Project Completed Successfully',
    summary: 'The local municipality has successfully concluded the lake rejuvenation and park development initiative. Over 10 acres of wetlands have been clean-restored with modern walk-paths and flora...',
    sourceName: 'Local Chronicle',
    publishedAt: '5h ago',
    views: '1.8k views',
    likes: '820',
    readingTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
  },
  {
    id: '3',
    category: 'LIFESTYLE',
    headline: "Culinary Gem 'The Spicery' Wins State Award",
    summary: 'A beloved family-owned eatery in the heart of Kukatpally has clinched the prestigious State Culinary Excellence Award. Known for its traditional preparations, the restaurant was founded in 1985...',
    sourceName: 'Metro Bulletin',
    publishedAt: '1d ago',
    views: '4.2k views',
    likes: '2.1k',
    readingTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  },
];

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
