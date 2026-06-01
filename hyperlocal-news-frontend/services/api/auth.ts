import { request } from './client';
import { API_ROUTES } from './routes';

export interface FirebaseAuthTokenPayload {
  idToken: string;
}

export interface DeviceTokenPayload {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export const authApi = {
  exchangeFirebaseToken: async (payload: FirebaseAuthTokenPayload) => {
    const response = await request<{ customToken?: string }>({
      url: API_ROUTES.auth.firebaseToken,
      method: 'POST',
      data: payload,
    });
    return response.data;
  },

  linkGoogleAccount: async (payload: FirebaseAuthTokenPayload) => {
    const response = await request<void>({
      url: API_ROUTES.auth.linkGoogle,
      method: 'POST',
      data: payload,
    });
    return response.data;
  },

  linkEmailAccount: async (payload: FirebaseAuthTokenPayload) => {
    const response = await request<void>({
      url: API_ROUTES.auth.linkEmail,
      method: 'POST',
      data: payload,
    });
    return response.data;
  },

  registerDeviceToken: async (payload: DeviceTokenPayload) => {
    const response = await request<void>({
      url: API_ROUTES.auth.deviceToken,
      method: 'POST',
      data: payload,
    });
    return response.data;
  },
};
