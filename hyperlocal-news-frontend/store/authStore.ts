import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  phoneNumber?: string;
  isGuest?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      sendOtp: async (phoneNumber: string) => {
        set({ isLoading: true });
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ isLoading: false });
        // In a real app, you might check if the phone number is valid or blocked here
        return true;
      },

      verifyOtp: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true });
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock successful verification
        set({
          user: {
            id: Math.random().toString(36).substr(2, 9),
            phoneNumber,
            isGuest: false,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      },

      loginAsGuest: () => {
        set({
          user: {
            id: 'guest-' + Math.random().toString(36).substr(2, 9),
            isGuest: true,
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
