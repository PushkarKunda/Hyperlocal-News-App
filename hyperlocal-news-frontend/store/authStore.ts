import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '@/utils/apiClient';

export interface User {
  id: string;
  phoneNumber?: string;
  isGuest?: boolean;
  name?: string;
  avatar?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  textSize?: 'small' | 'medium' | 'large';
  email?: string;
  isPublisher?: boolean;
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (name: string, avatar?: string, email?: string, phoneNumber?: string, isPublisher?: boolean, emailVerified?: boolean) => void;
  updateLanguage: (language: string) => void;
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateTextSize: (textSize: 'small' | 'medium' | 'large') => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,

      sendOtp: async (phoneNumber: string) => {
        set({ isLoading: true });
        const response = await ApiService.sendOtp(phoneNumber);
        set({ isLoading: false });
        return response.success && response.data === true;
      },

      verifyOtp: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true });
        const response = await ApiService.verifyOtp(phoneNumber, otp);
        
        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      loginAsGuest: () => {
        set({
          user: {
            id: 'guest-' + Math.random().toString(36).substr(2, 9),
            isGuest: true,
          },
          isAuthenticated: true,
          isOnboarded: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
        });
      },

      updateProfile: (name: string, avatar?: string, email?: string, phoneNumber?: string, isPublisher?: boolean, emailVerified?: boolean) => {
        set((state) => {
          if (!state.user) return {};
          return {
            user: {
              ...state.user,
              name,
              avatar: avatar || state.user.avatar,
              email: email !== undefined ? email : state.user.email,
              phoneNumber: phoneNumber || state.user.phoneNumber,
              isPublisher: isPublisher !== undefined ? isPublisher : state.user.isPublisher,
              emailVerified: emailVerified !== undefined ? emailVerified : state.user.emailVerified,
            },
          };
        });
      },

      updateLanguage: (language: string) => {
        set((state) => {
          const defaultUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            isGuest: true,
          };
          const currentUser = state.user || defaultUser;
          return {
            user: {
              ...currentUser,
              language,
            },
          };
        });
      },

      updateTheme: (theme: 'light' | 'dark' | 'system') => {
        set((state) => {
          const defaultUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            isGuest: true,
          };
          const currentUser = state.user || defaultUser;
          return {
            user: {
              ...currentUser,
              theme,
            },
          };
        });
      },

      updateTextSize: (textSize: 'small' | 'medium' | 'large') => {
        set((state) => {
          const defaultUser = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            isGuest: true,
          };
          const currentUser = state.user || defaultUser;
          return {
            user: {
              ...currentUser,
              textSize,
            },
          };
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
