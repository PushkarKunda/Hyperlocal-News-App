// hooks/useApi.ts
import { useQuery } from '@tanstack/react-query';
import { locationApi, newsApi, categoriesApi } from '@/services/api';

const getGlyphForLanguage = (code: string, name: string): string => {
  switch (code.toLowerCase()) {
    case 'en': return 'Aa';
    case 'hi': return 'अ';
    case 'te': return 'అ';
    case 'ta': return 'அ';
    case 'ml': return 'അ';
    case 'kn': return 'ಅ';
    case 'bn': return 'অ';
    case 'gu': return 'અ';
    case 'mr': return 'अ';
    case 'or': return 'ଅ';
    case 'pa': return 'ਅ';
    case 'ur': return 'ا';
    default: return name.charAt(0);
  }
};

// ✅ REMOVED useMocks - all real API calls

export function useNewsFeed() {
  return useQuery({
    queryKey: ['news-feed'],
    queryFn: () => newsApi.list(),
  });
}

export function useCategoriesList() {
  return useQuery({
    queryKey: ['categories-list'],
    queryFn: () => categoriesApi.list(),
  });
}

export function useLanguagesList() {
  return useQuery({
    queryKey: ['languages-list'],
    queryFn: async () => {
      const response = await locationApi.getLanguages();
      return response.map(lang => ({
        id: lang.code,
        name: lang.name,
        glyph: getGlyphForLanguage(lang.code, lang.name),
      }));
    },
  });
}

export function useStatesList() {
  return useQuery({
    queryKey: ['states-list'],
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

export function useDistrictsList(stateId: string | undefined) {
  return useQuery({
    queryKey: ['districts-list', stateId],
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
