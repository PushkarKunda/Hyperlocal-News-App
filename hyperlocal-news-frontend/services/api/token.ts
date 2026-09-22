// services/api/token.ts
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Verified active dev test tokens (with configured preferences: Telugu / Andhra Pradesh / Bapatla)
const DEFAULT_DEV_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4SzBLWk5FMSIsInJvbGUiOjEsImV4cCI6MTc5MDExNDU5MCwidmVyIjowfQ.qLjhOGCG6V_sg7RcZD-f9EkZiBR_pUsdNzoWB6XzZAY';
const DEFAULT_DEV_REFRESH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4SzBLWk5FMSIsInJvbGUiOjEsImV4cCI6MTc5MDcwOTM2NiwidHlwZSI6InJlZnJlc2gifQ.5RpenNB6yaxOaYBlmKfh_j9KcAiBwc1tcaGEHsf4rrg';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    // Ignore known expired dev token if previously stored
    if (token && !token.includes('eyJzdWIiOiJRSkg2Q0U1Sy')) {
      return token;
    }
  } catch {
    // fall through
  }

  const fallback =
    process.env.EXPO_PUBLIC_DEV_TEST_TOKEN || DEFAULT_DEV_TOKEN;

  // Auto-seed SecureStore so other services / background tasks have access
  try {
    if (fallback) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, fallback);
    }
  } catch {
    // ignore secure store write error
  }

  return fallback;
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (token) return token;
  } catch {
    // fall through
  }

  const fallback =
    process.env.EXPO_PUBLIC_DEV_TEST_REFRESH_TOKEN || DEFAULT_DEV_REFRESH_TOKEN;

  try {
    if (fallback) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, fallback);
    }
  } catch {
    // ignore
  }

  return fallback;
};

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};