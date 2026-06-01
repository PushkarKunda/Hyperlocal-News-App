export type AuthTokenProvider = () => string | null | Promise<string | null>;

let authTokenProvider: AuthTokenProvider | null = null;

export const setAuthTokenProvider = (provider: AuthTokenProvider | null) => {
  authTokenProvider = provider;
};

export const getAuthToken = async () => {
  if (!authTokenProvider) return null;
  return authTokenProvider();
};
