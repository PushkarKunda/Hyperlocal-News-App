export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  handle?: string;
  avatar?: string;
  location: UserLocation;
  language: string;
  interests: string[];
  isVerified: boolean;
  isPublisher?: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  gender?: string;
  date_of_birth?: string;
  profile_picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLocation {
  state: string;
  stateId: string;
  district: string;
  districtId: string;
  city: string;
  cityId: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserPreferences {
  language: string;
  location: UserLocation;
  interests: string[];
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  breaking: boolean;
  daily: boolean;
  weekly: boolean;
  local: boolean;
  marketing: boolean;
}

export interface PublisherProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  logo?: string;
  website?: string;
  isVerified: boolean;
  followersCount: number;
  articlesCount: number;
  createdAt: string;
}