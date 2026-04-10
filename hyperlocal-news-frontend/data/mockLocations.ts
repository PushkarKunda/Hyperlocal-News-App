import { State, District, City, Language } from '@/types';

export const MOCK_STATES: State[] = [
  { id: '1', name: 'Telangana', code: 'TS' },
  { id: '2', name: 'Andhra Pradesh', code: 'AP' },
  { id: '3', name: 'Karnataka', code: 'KA' },
  { id: '4', name: 'Tamil Nadu', code: 'TN' },
  { id: '5', name: 'Maharashtra', code: 'MH' },
  { id: '6', name: 'Delhi', code: 'DL' },
];

export const MOCK_DISTRICTS: District[] = [
  { id: '1', name: 'Hyderabad', stateId: '1' },
  { id: '2', name: 'Warangal', stateId: '1' },
  { id: '3', name: 'Nizamabad', stateId: '1' },
  { id: '4', name: 'Karimnagar', stateId: '1' },
  { id: '5', name: 'Visakhapatnam', stateId: '2' },
  { id: '6', name: 'Vijayawada', stateId: '2' },
  { id: '7', name: 'Bangalore Urban', stateId: '3' },
  { id: '8', name: 'Chennai', stateId: '4' },
];

export const MOCK_CITIES: City[] = [
  { id: '1', name: 'Kukatpally', districtId: '1' },
  { id: '2', name: 'Banjara Hills', districtId: '1' },
  { id: '3', name: 'Gachibowli', districtId: '1' },
  { id: '4', name: 'Hitech City', districtId: '1' },
  { id: '5', name: 'Secunderabad', districtId: '1' },
  { id: '6', name: 'Madhapur', districtId: '1' },
  { id: '7', name: 'Ameerpet', districtId: '1' },
  { id: '8', name: 'Kondapur', districtId: '1' },
];

export const MOCK_LANGUAGES: Language[] = [
  { id: '1', code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { id: '2', code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isRTL: false },
  { id: '3', code: 'hi', name: 'Hindi', nativeName: 'हिंदी', isRTL: false },
  { id: '4', code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isRTL: false },
  { id: '5', code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isRTL: false },
];