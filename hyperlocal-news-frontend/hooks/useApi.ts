import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi, newsApi, categoriesApi, eventsApi } from '@/services/api';

const STATIC_INTERESTS = [
  { id: 'tech', name: 'Tech', slug: 'tech', emoji: '💻', description: 'Tech & innovation' },
  { id: 'design', name: 'Design', slug: 'design', emoji: '🎨', description: 'Design & creativity' },
  { id: 'sports', name: 'Sports', slug: 'sports', emoji: '⚽', description: 'Games & athletics' },
  { id: 'music', name: 'Music', slug: 'music', emoji: '🎵', description: 'Songs & artists' },
  { id: 'art', name: 'Art', slug: 'art', emoji: '🖌️', description: 'Visual & fine arts' },
  { id: 'travel', name: 'Travel', slug: 'travel', emoji: '🧭', description: 'Journeys & nature' },
  { id: 'food', name: 'Food', slug: 'food', emoji: '🥪', description: 'Culinary & cooking' },
  { id: 'gaming', name: 'Gaming', slug: 'gaming', emoji: '🎮', description: 'E-sports & updates' },
  { id: 'wellness', name: 'Health & Wellness', slug: 'wellness', emoji: '🏥', description: 'Mindfulness and healthy living' },
];

// 1. News feed hook
export function useNewsFeed() {
  return useQuery({
    queryKey: ['news-feed', 'api'],
    queryFn: async () => {
      return await newsApi.list();
    },
  });
}

// 2. News Article details hook
export function useArticleDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['article-details', id],
    queryFn: async () => {
      if (!id) return undefined;
      return await newsApi.getById(id);
    },
    enabled: !!id,
  });
}

// 2b. Categories list hook
export function useCategoriesList() {
  return useQuery({
    queryKey: ['categories-list', 'api'],
    queryFn: async () => {
      return await categoriesApi.list();
    },
  });
}

const getGlyphForLanguage = (code: string, name: string): string => {
  switch (code.toLowerCase()) {
    case 'en': return 'Aa';
    case 'hi': return 'अ';
    case 'te': return 'అ';
    case 'ta': return 'அ';
    case 'ml': return 'അ';
    case 'kn': return 'അ';
    case 'bn': return 'অ';
    case 'gu': return 'અ';
    case 'mr': return 'अ';
    case 'or': return 'ଅ';
    case 'pa': return 'ਅ';
    case 'ur': return 'ا';
    default: return name.charAt(0);
  }
};

// 2c. Languages list hook
export function useLanguagesList() {
  return useQuery({
    queryKey: ['languages-list', 'api'],
    queryFn: async () => {
      const response = await locationApi.getLanguages();
      return response.map(lang => ({
        id: lang.code, // Map to code ('en', 'te', 'hi') to preserve matching with local UI selectedLanguage default
        name: lang.name,
        glyph: getGlyphForLanguage(lang.code, lang.name),
      }));
    },
  });
}

// 3. States list hook (for onboarding locations)
export function useStatesList() {
  return useQuery({
    queryKey: ['states-list', 'api'],
    queryFn: async () => {
      const response = await locationApi.getStates();
      return response.map(state => ({
        id: state.name.toLowerCase() === 'andhra pradesh' ? 'ap' : (state.name.toLowerCase() === 'telangana' ? 'ts' : String(state.id)),
        name: state.name,
        code: state.name.toLowerCase() === 'andhra pradesh' ? 'AP' : (state.name.toLowerCase() === 'telangana' ? 'TS' : state.name.substring(0, 2).toUpperCase()),
      }));
    },
  });
}

// 4. Districts list hook (for onboarding locations)
export function useDistrictsList(stateId: string | undefined) {
  return useQuery({
    queryKey: ['districts-list', stateId, 'api'],
    queryFn: async () => {
      if (!stateId) return [];
      const response = await locationApi.getDistricts();
      
      let backendStateId: number | null = null;
      if (stateId === 'ap') {
        backendStateId = 1;
      } else if (stateId === 'ts') {
        backendStateId = 2;
      } else {
        const parsed = Number(stateId);
        if (Number.isFinite(parsed)) backendStateId = parsed;
      }

      if (backendStateId === null) return [];

      return response
        .filter(d => d.state_id === backendStateId)
        .map(d => ({
          id: d.name.toLowerCase() === 'hyderabad' ? 'hyderabad' : (d.name.toLowerCase() === 'visakhapatnam' ? 'visakhapatnam' : String(d.id)),
          name: d.name,
          code: d.name.substring(0, 3).toUpperCase(),
          stateId: stateId,
        }));
    },
    enabled: !!stateId,
  });
}

// 5. Onboarding Interests / Topics hook
export function useInterestsList() {
  return useQuery({
    queryKey: ['interests-list'],
    queryFn: async () => {
      return STATIC_INTERESTS;
    },
  });
}

// 6. Shorts videos feed hook
export function useShortsList() {
  return useQuery({
    queryKey: ['shorts-list'],
    queryFn: async () => {
      return [];
    },
  });
}

// 7. Local Events feed hook
export function useEventsList() {
  return useQuery({
    queryKey: ['events-list'],
    queryFn: async () => {
      return await eventsApi.list();
    },
  });
}

// 8. Discover page trending hook
export function useTrendingList() {
  return useQuery({
    queryKey: ['trending-list'],
    queryFn: async () => {
      return [];
    },
  });
}

// 9. Discover page sources hook
export function useSourcesList() {
  return useQuery({
    queryKey: ['sources-list'],
    queryFn: async () => {
      return [];
    },
  });
}

// 10. Discover page localities hook
export function useLocalitiesList() {
  return useQuery({
    queryKey: ['localities-list'],
    queryFn: async () => {
      return [];
    },
  });
}

// 11. Immersive news hook
export function useImmersiveNewsList() {
  return useQuery({
    queryKey: ['immersive-news-list'],
    queryFn: async () => {
      return [];
    },
  });
}
