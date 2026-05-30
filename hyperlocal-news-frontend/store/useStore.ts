import { create } from 'zustand';
import { NewsArticle, User, Poll } from '@/types';
import { MOCK_USER, MOCK_NEWS, MOCK_BREAKING_NEWS, MOCK_POLLS } from '@/data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // --- Bookmarks ---
  bookmarkedArticleIds: string[];
  toggleBookmark: (articleId: string) => void;

  // --- User / Publisher status ---
  user: User;
  publisherRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';
  requestPublisherAccess: () => void;
  /** Dev-only: toggle publisher approval to simulate admin action */
  approvePublisherRequest: () => void;

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

const SEED_ARTICLES = [...MOCK_NEWS, ...MOCK_BREAKING_NEWS];

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
  user: MOCK_USER,
  publisherRequestStatus: 'none',

  requestPublisherAccess: () =>
    set((state) => {
      // Only allow requesting if not already a publisher
      if (state.user.isPublisher || state.publisherRequestStatus !== 'none') {
        return state;
      }
      return { publisherRequestStatus: 'pending' };
    }),

  approvePublisherRequest: () =>
    set((state) => ({
      publisherRequestStatus: 'approved',
      user: { ...state.user, isPublisher: true },
    })),

  // --- Articles ---
  allArticles: SEED_ARTICLES,

  submitArticle: (draft) =>
    set((state) => {
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
          isVerified: state.user.isPublisher,
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
  polls: MOCK_POLLS,

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
