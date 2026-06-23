// store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  sendPhoneOTP,
  verifyPhoneOTP,
  signInWithGoogle,
  firebaseSignOut,
} from '@/services/firebase';
import { authApi, BackendLoginResponse, usersApi, API_CONFIG } from '@/services/api';
import { clearTokens } from '@/services/api/token';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  user_uid: string;
  user_name: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: number; // 1=USER, 2=PUBLISHER, 3=MODERATOR, 4=EMPLOYEE, 5=ADMIN
  email_verified: boolean;
  mobile_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  // UI extras
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  avatar?: string;
  phoneNumber?: string;
  interests?: string[];
  state?: string;
  district?: string;
  isPublisher?: boolean;
}

const sanitizeUser = (user: User): User => {
  const isPhone = (str: string | null | undefined): boolean => {
    if (!str) return false;
    const clean = str.replace(/[\s\-()]/g, '');
    return /^\+?\d{7,15}$/.test(clean);
  };

  let updatedName = user.name;
  let updatedPhone = user.phone;
  let updatedPhoneNumber = user.phoneNumber;
  let updatedMobileVerified = user.mobile_verified;

  // 1. If name is actually a phone number, clear name and set phone fields
  if (isPhone(user.name)) {
    updatedName = null;
    if (!updatedPhone) {
      updatedPhone = user.name;
    }
  }

  // 2. Sync phone and phoneNumber fields
  if (updatedPhone && !updatedPhoneNumber) {
    updatedPhoneNumber = updatedPhone;
  } else if (updatedPhoneNumber && !updatedPhone) {
    updatedPhone = updatedPhoneNumber;
  }

  // 3. If phone number is present and we logged in via OTP, set mobile_verified to true
  if (updatedPhone) {
    updatedMobileVerified = true;
  }

  return {
    ...user,
    name: updatedName,
    phone: updatedPhone,
    phoneNumber: updatedPhoneNumber,
    mobile_verified: updatedMobileVerified,
  };
};

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;

  // Phone Auth (Firebase)
  phoneConfirmation: FirebaseAuthTypes.ConfirmationResult | null;

  // Actions
  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyPhoneOTP: (otp: string) => Promise<BackendLoginResponse>;
  loginWithGoogle: (idToken: string) => Promise<BackendLoginResponse>;
  logout: () => Promise<void>;

  // Profile
  updateProfile: (
    nameOrUpdates: string | Partial<User>,
    avatar?: string,
    email?: string,
    phone?: string,
    emailVerified?: boolean,
    mobileVerified?: boolean
  ) => void;
  updateLanguage: (language: string) => void;
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Publisher
  switchToPublisher: () => Promise<void>;
  checkPublisherEligibility: () => Promise<{
    eligible: boolean;
    missing_requirements: string[];
  }>;

  // Onboarding
  completeOnboarding: () => Promise<void>;

  // Helpers
  clearError: () => void;
  isPublisher: () => boolean;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
      error: null,
      phoneConfirmation: null,

      // ─── Phone Auth ─────────────────────────────────────────────────────

      sendPhoneOTP: async (phoneNumber: string) => {
        set({ isLoading: true, error: null });
        try {
          const confirmation = await sendPhoneOTP(phoneNumber);
          set({ phoneConfirmation: confirmation, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to send OTP',
          });
          throw error;
        }
      },

      verifyPhoneOTP: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const { phoneConfirmation } = get();
          if (!phoneConfirmation) throw new Error('No OTP session found');

          // Step 1: Verify OTP with Firebase → get Firebase token
          const firebaseToken = await verifyPhoneOTP(phoneConfirmation, otp);

          // Step 2: Exchange Firebase token with backend → get JWT
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isAuthenticated: true,
            isOnboarded: !response.is_new_user,
            isLoading: false,
            phoneConfirmation: null,
          });

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'OTP verification failed',
          });
          throw error;
        }
      },

      // ─── Google Auth ────────────────────────────────────────────────────

      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          // Step 1: Google OAuth via Firebase → get Firebase token
          const firebaseToken = await signInWithGoogle(idToken);

          // Step 2: Exchange Firebase token with backend → get JWT
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isAuthenticated: true,
            isOnboarded: !response.is_new_user,
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Google sign-in failed',
          });
          throw error;
        }
      },

      // ─── Logout ─────────────────────────────────────────────────────────

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Continue even if API fails
        } finally {
          await firebaseSignOut();
          await clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isOnboarded: false,
            isLoading: false,
            error: null,
            phoneConfirmation: null,
          });
        }
      },

      // ─── Publisher ──────────────────────────────────────────────────────

      switchToPublisher: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.switchToPublisher();
          // Update role in store
          set((state) => ({
            user: state.user ? { ...state.user, role: 2 } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to switch to publisher',
          });
          throw error;
        }
      },

      checkPublisherEligibility: async () => {
        return await authApi.checkPublisherEligibility();
      },

      // ─── Profile ────────────────────────────────────────────────────────

      updateProfile: (
        nameOrUpdates: string | Partial<User>,
        avatar?: string,
        email?: string,
        phone?: string,
        emailVerified?: boolean,
        mobileVerified?: boolean
      ) => {
        if (typeof nameOrUpdates === 'object') {
          set((state) => ({
            user: state.user ? sanitizeUser({ ...state.user, ...nameOrUpdates }) : null,
          }));
        } else {
          set((state) => ({
            user: state.user
              ? sanitizeUser({
                  ...state.user,
                  name: nameOrUpdates,
                  avatar: avatar ?? state.user.avatar,
                  email: email ?? state.user.email,
                  phone: phone ?? state.user.phone,
                  email_verified: emailVerified ?? state.user.email_verified,
                  mobile_verified: mobileVerified ?? state.user.mobile_verified,
                })
              : null,
          }));
        }
      },

      updateLanguage: (language: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, language } : null,
        }));
      },

      updateTheme: (theme: 'light' | 'dark' | 'system') => {
        set((state) => ({
          user: state.user ? { ...state.user, theme } : null,
        }));
      },

      // ─── Helpers ────────────────────────────────────────────────────────

      completeOnboarding: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!API_CONFIG.useMocks) {
            const { user } = get();
            if (user) {
              // 1. Update main user profile info (PUT /user/users/me)
              await usersApi.updateMe({
                name: user.name ?? undefined,
                email: user.email ?? undefined,
                phone: user.phone ?? undefined,
                emailVerified: user.email_verified,
                mobileVerified: user.mobile_verified,
              });

              // 2. Update preferences (PATCH /user/preferences/me)
              await usersApi.updatePreferences({
                language: user.language,
                state: user.state,
                district: user.district,
                interests: user.interests,
              } as any);
            }
          }
          set({ isOnboarded: true, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to complete onboarding on server',
          });
          // Still set onboarded locally so the user is not stuck
          set({ isOnboarded: true });
        }
      },

      clearError: () => set({ error: null }),

      isPublisher: () => (get().user?.role ?? 0) >= 2,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist phoneConfirmation (not serializable)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);
