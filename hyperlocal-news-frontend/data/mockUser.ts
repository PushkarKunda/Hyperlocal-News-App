import { User, UserPreferences } from '@/types';

export const MOCK_USER: User = {
  id: '1',
  phone: '+919876543210',
  email: 'user@example.com',
  name: 'Rahul Kumar',
  avatar: 'https://via.placeholder.com/100',
  location: {
    state: 'Telangana',
    stateId: '1',
    district: 'Hyderabad',
    districtId: '1',
    city: 'Kukatpally',
    cityId: '1',
  },
  language: 'en',
  interests: ['technology', 'sports', 'local', 'business'],
  isVerified: true,
  isPublisher: false,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-10T14:45:00Z',
};

export const MOCK_USER_PREFERENCES: UserPreferences = {
  language: 'en',
  location: {
    state: 'Telangana',
    stateId: '1',
    district: 'Hyderabad',
    districtId: '1',
    city: 'Kukatpally',
    cityId: '1',
  },
  interests: ['technology', 'sports', 'local', 'business'],
  notifications: {
    breaking: true,
    daily: true,
    weekly: false,
    local: true,
    marketing: false,
  },
  theme: 'system',
};

export const MOCK_GUEST_USER: User = {
  id: 'guest',
  phone: '',
  location: {
    state: '',
    stateId: '',
    district: '',
    districtId: '',
    city: '',
    cityId: '',
  },
  language: 'en',
  interests: [],
  isVerified: false,
  isPublisher: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};