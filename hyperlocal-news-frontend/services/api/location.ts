import { request } from './client';
import { API_ROUTES } from './routes';

export interface GeneratedLanguageOut {
  id: number;
  name: string;
  code: string;
}

export interface GeneratedStateOut {
  id: number;
  name: string;
}

export interface GeneratedDistrictOut {
  id: number;
  name: string;
  state_id: number;
}

export interface GeneratedCityOut {
  id: number;
  name: string;
  district_id: number;
}

export const locationApi = {
  getLanguages: async () => {
    return await request<GeneratedLanguageOut[]>({
      url: API_ROUTES.location.languages,
      method: 'GET',
    });
  },

  getStates: async (search?: string) => {
    return await request<GeneratedStateOut[]>({
      url: API_ROUTES.location.states,
      method: 'GET',
      params: search ? { search, limit: 100, offset: 0 } : undefined,
    });
  },

  getDistricts: async () => {
    return await request<GeneratedDistrictOut[]>({
      url: API_ROUTES.location.districts,
      method: 'GET',
    });
  },

  getCities: async () => {
    return await request<GeneratedCityOut[]>({
      url: API_ROUTES.location.cities,
      method: 'GET',
    });
  },
};
