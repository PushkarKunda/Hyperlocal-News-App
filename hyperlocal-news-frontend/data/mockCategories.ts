import { Category, Interest } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'For You', slug: 'for-you', icon: 'auto-awesome', color: '#4648D4' },
  { id: '2', name: 'Local', slug: 'local', icon: 'location-on', color: '#10B981' },
  { id: '3', name: 'Politics', slug: 'politics', icon: 'account-balance', color: '#EF4444' },
  { id: '4', name: 'Sports', slug: 'sports', icon: 'sports-soccer', color: '#F59E0B' },
  { id: '5', name: 'Business', slug: 'business', icon: 'business', color: '#3B82F6' },
  { id: '6', name: 'Technology', slug: 'technology', icon: 'computer', color: '#8B5CF6' },
  { id: '7', name: 'Entertainment', slug: 'entertainment', icon: 'movie', color: '#EC4899' },
  { id: '8', name: 'Health', slug: 'health', icon: 'health-and-safety', color: '#14B8A6' },
  { id: '9', name: 'Education', slug: 'education', icon: 'school', color: '#6366F1' },
  { id: '10', name: 'Crime', slug: 'crime', icon: 'gavel', color: '#64748B' },
];

export const MOCK_INTERESTS: Interest[] = [
  { id: '1', name: 'Politics', slug: 'politics', emoji: '🏛️', description: 'Government & elections' },
  { id: '2', name: 'Sports', slug: 'sports', emoji: '⚽', description: 'Games & athletics' },
  { id: '3', name: 'Business', slug: 'business', emoji: '💼', description: 'Economy & markets' },
  { id: '4', name: 'Technology', slug: 'technology', emoji: '💻', description: 'Tech & innovation' },
  { id: '5', name: 'Health', slug: 'health', emoji: '🏥', description: 'Medical & wellness' },
  { id: '6', name: 'Entertainment', slug: 'entertainment', emoji: '🎬', description: 'Movies & shows' },
  { id: '7', name: 'Local', slug: 'local', emoji: '📍', description: 'Neighborhood news' },
  { id: '8', name: 'National', slug: 'national', emoji: '🇮🇳', description: 'Country-wide news' },
  { id: '9', name: 'Crime', slug: 'crime', emoji: '🚔', description: 'Law & order' },
  { id: '10', name: 'Education', slug: 'education', emoji: '📚', description: 'Schools & learning' },
  { id: '11', name: 'Weather', slug: 'weather', emoji: '🌤️', description: 'Forecasts & climate' },
  { id: '12', name: 'Lifestyle', slug: 'lifestyle', emoji: '✨', description: 'Living & culture' },
];