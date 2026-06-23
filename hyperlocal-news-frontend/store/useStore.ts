import { create } from 'zustand';
import { NewsArticle, User, Poll } from '@/types';
import { API_DATABASE } from '@/utils/apiClient';
import { usersApi } from '@/services/api';

// const MOCK_USER: User = {
//   id: '1',
//   phone: '+919876543210',
//   email: 'user@example.com',
//   name: 'Rahul Kumar',
//   avatar: 'https://via.placeholder.com/100',
//   location: {
//     state: 'Telangana',
//     stateId: '1',
//     district: 'Hyderabad',
//     districtId: '1',
//     city: 'Kukatpally',
//     cityId: '1',
//   },
//   language: 'en',
//   interests: ['technology', 'sports', 'local', 'business'],
//   isVerified: true,
//   isPublisher: false,
//   createdAt: '2024-01-15T10:30:00Z',
//   updatedAt: '2024-03-10T14:45:00Z',
// };

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // --- Bookmarks ---
  bookmarkedArticleIds: string[];
  toggleBookmark: (articleId: string) => void;

  // --- User / Publisher status ---
  user: User | null;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  publisherRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  requestPublisherAccess: () => void;

  // --- Publisher Articles ---
  /** All articles ever created (mock seed + publisher-submitted) */
  allArticles: NewsArticle[];
  /** Submit a new article from the publisher (goes to 'pending' status) */
  submitArticle: (
    article: Omit<NewsArticle, 'id' | 'status' | 'publishedAt' | 'stats' | 'url' | 'source'>
  ) => void;
  /** Simulate admin approving a pending article */
  approveArticle: (articleId: string) => void;
  /** Simulate admin rejecting a pending article */
  rejectArticle: (articleId: string) => void;

  // --- Polls ---
  polls: Poll[];
  votePoll: (pollId: string, optionId: string) => void;
  undoVotePoll: (pollId: string) => void;
}

// ─── Initial seed data ────────────────────────────────────────────────────────

const SEED_ARTICLES = [...API_DATABASE.news, ...API_DATABASE.breakingNews];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set) => ({
  // --- Bookmarks ---
  bookmarkedArticleIds: [],
  toggleBookmark: (articleId) =>
    set((state) => ({
      bookmarkedArticleIds: state.bookmarkedArticleIds.includes(articleId)
        ? state.bookmarkedArticleIds.filter((id) => id !== articleId)
        : [...state.bookmarkedArticleIds, articleId],
    })),

  // --- User ---
  user: null,
  loadUser: async () => {
    try {
      const user = await usersApi.me();
      set({ user });
    } catch {
      set({ user: null });
    }
  },
  setUser: (user) => set({ user }),
  publisherRequestStatus: 'none',

  requestPublisherAccess: () =>
    set((state) => {
      // Only allow requesting if not already a publisher
      if (state.user?.isPublisher || state.publisherRequestStatus !== 'none') {
        return state;
      }
      return { publisherRequestStatus: 'pending' };
    }),

  // --- Articles ---
  allArticles: SEED_ARTICLES,

  submitArticle: (draft) =>
    set((state) => {
      if (!state.user) {
        return state;
      }

      const newArticle: NewsArticle = {
        ...draft,
        id: `pub-${Date.now()}`,
        status: 'pending',
        publishedAt: new Date().toISOString(),
        publisherId: state.user.id,
        url: `https://hyperlocal.app/article/pub-${Date.now()}`,
        source: {
          id: state.user.id,
          name: state.user.name ?? 'Community Publisher',
          isVerified: state.user.isPublisher ?? false,
        },
        stats: { views: 0, likes: 0, shares: 0, comments: 0, bookmarks: 0 },
      };
      return { allArticles: [newArticle, ...state.allArticles] };
    }),

  approveArticle: (articleId) =>
    set((state) => ({
      allArticles: state.allArticles.map((a) =>
        a.id === articleId ? { ...a, status: 'published' } : a
      ),
    })),

  rejectArticle: (articleId) =>
    set((state) => ({
      allArticles: state.allArticles.map((a) =>
        a.id === articleId ? { ...a, status: 'rejected' } : a
      ),
    })),

  // --- Polls ---
  polls: API_DATABASE.polls,

  votePoll: (pollId, optionId) =>
    set((state) => ({
      polls: state.polls.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          hasVoted: true,
          selectedOptionId: optionId,
          totalVotes: p.totalVotes + 1,
          options: p.options.map((o) =>
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o
          ),
        };
      }),
    })),

  undoVotePoll: (pollId) =>
    set((state) => ({
      polls: state.polls.map((p) => {
        if (p.id !== pollId || !p.hasVoted) return p;
        const previouslySelected = p.selectedOptionId;
        return {
          ...p,
          hasVoted: false,
          selectedOptionId: undefined,
          totalVotes: Math.max(0, p.totalVotes - 1),
          options: p.options.map((o) =>
            o.id === previouslySelected ? { ...o, votes: Math.max(0, o.votes - 1) } : o
          ),
        };
      }),
    })),
}));
