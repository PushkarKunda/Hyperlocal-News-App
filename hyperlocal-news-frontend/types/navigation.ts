export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'article/[id]': {
    id: string;
    url: string;
    title: string;
  };
  settings: undefined;
  'publisher-request': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  'verify-otp': {
    phone: string;
  };
};

export type OnboardingStackParamList = {
  language: undefined;
  location: undefined;
  interests: undefined;
  complete: undefined;
};

export type TabParamList = {
  index: undefined;
  shorts: undefined;
  local: undefined;
  discover: undefined;
  profile: undefined;
};