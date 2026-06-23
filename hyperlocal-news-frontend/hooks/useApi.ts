import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/utils/apiClient';
import { API_CONFIG, locationApi, newsApi, categoriesApi } from '@/services/api';

// 1. News feed hook
export function useNewsFeed() {
  return useQuery({
    queryKey: ['news-feed', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        const response = await ApiService.getNews();
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to load news');
        }
        return response.data;
      }
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
      const response = await ApiService.getArticleById(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load article');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// 2b. Categories list hook
export function useCategoriesList() {
  return useQuery({
    queryKey: ['categories-list', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        const response = await ApiService.getCategories();
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to load categories');
        }
        return response.data;
      }
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
    queryKey: ['languages-list', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        const response = await ApiService.getLanguages();
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to load languages');
        }
        return response.data;
      }
      
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
    queryKey: ['states-list', API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (API_CONFIG.useMocks) {
        const response = await ApiService.getStates();
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to load states');
        }
        return response.data;
      }
      
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
    queryKey: ['districts-list', stateId, API_CONFIG.useMocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (!stateId) return [];
      if (API_CONFIG.useMocks) {
        const response = await ApiService.getDistrictsByState(stateId);
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to load districts');
        }
        return response.data;
      }
      
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
      const response = await ApiService.getInterests();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load interests');
      }
      return response.data;
    },
  });
}

// 6. Shorts videos feed hook
export function useShortsList() {
  return useQuery({
    queryKey: ['shorts-list'],
    queryFn: async () => {
      const response = await ApiService.getShorts();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load shorts');
      }
      return response.data;
    },
  });
}

// 7. Local Events feed hook
export function useEventsList() {
  return useQuery({
    queryKey: ['events-list'],
    queryFn: async () => {
      const response = await ApiService.getEvents();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load events');
      }
      return response.data;
    },
  });
}

// 8. Discover page trending hook
export function useTrendingList() {
  return useQuery({
    queryKey: ['trending-list'],
    queryFn: async () => {
      const response = await ApiService.getTrending();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load trending');
      }
      return response.data;
    },
  });
}

// 9. Discover page sources hook
export function useSourcesList() {
  return useQuery({
    queryKey: ['sources-list'],
    queryFn: async () => {
      const response = await ApiService.getSources();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load sources');
      }
      return response.data;
    },
  });
}

// 10. Discover page localities hook
export function useLocalitiesList() {
  return useQuery({
    queryKey: ['localities-list'],
    queryFn: async () => {
      const response = await ApiService.getLocalities();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load localities');
      }
      return response.data;
    },
  });
}

// 11. Immersive news hook
export function useImmersiveNewsList() {
  return useQuery({
    queryKey: ['immersive-news-list'],
    queryFn: async () => {
      const response = await ApiService.getImmersiveNews();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load immersive news');
      }
      return response.data;
    },
  });
}
