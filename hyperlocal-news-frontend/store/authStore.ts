// store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  sendPhoneOTP as firebaseSendOTP,
  verifyPhoneOTP as firebaseVerifyOTP,
  signInWithGoogle as firebaseGoogleSignIn,
  firebaseSignOut,
  linkGoogleAccount,
  linkPhoneNumber,
} from '@/services/firebase';
import { authApi, BackendLoginResponse, usersApi } from '@/services/api';
import type { UpdateMePayload } from '@/services/api/users';
import { clearTokens } from '@/services/api/token';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  user_uid: string;
  user_name: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: number;
  email_verified: boolean;
  mobile_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  avatar?: string;
  profile_picture?: string;
  phoneNumber?: string;
  interests?: string[];
  state?: string;
  district?: string;
  isPublisher?: boolean;
  gender?: string;
  date_of_birth?: string;
}

// ✅ RawUser - profile_picture can be null from server
type RawUser = Omit<User, 'is_suspended' | 'created_at' | 'profile_picture'> & {
  is_suspended?: boolean;
  created_at?: string;
  role_name?: string;
  is_new_user?: boolean;
  profile_picture?: string | null;
};

const sanitizeUser = (user: RawUser): User => {
  const isPhone = (str: string | null | undefined): boolean => {
    if (!str) return false;
    const clean = str.replace(/[\s\-()]/g, '');
    return /^\+?\d{7,15}$/.test(clean);
  };

  let updatedName = user.name;
  let updatedPhone = user.phone;
  let updatedPhoneNumber = user.phoneNumber;
  let updatedMobileVerified = user.mobile_verified;

  if (isPhone(user.name)) {
    updatedName = null;
    if (!updatedPhone) updatedPhone = user.name;
  }

  if (updatedPhone && !updatedPhoneNumber) {
    updatedPhoneNumber = updatedPhone;
  } else if (updatedPhoneNumber && !updatedPhone) {
    updatedPhone = updatedPhoneNumber;
  }

  if (updatedPhone) {
    updatedMobileVerified = true;
  }

  const profilePicture = user.profile_picture ?? undefined;

  return {
    ...user,
    is_suspended: user.is_suspended ?? false,
    created_at: user.created_at ?? '',
    name: updatedName,
    phone: updatedPhone,
    phoneNumber: updatedPhoneNumber,
    mobile_verified: updatedMobileVerified,
    isPublisher: user.role >= 2,
    avatar: user.avatar || profilePicture || undefined,
    profile_picture: profilePicture,
  };
};

// ─── Auth State Interface ─────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;

  phoneConfirmation: FirebaseAuthTypes.ConfirmationResult | null;
  pendingPhone: string | null;
  pendingVerificationId: string | null;
  lastOtpSentTime: number | null;

  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyPhoneOTP: (otp: string) => Promise<BackendLoginResponse>;
  loginWithGoogle: (idToken: string) => Promise<BackendLoginResponse>;
  linkGoogle: (idToken: string) => Promise<BackendLoginResponse>;
  linkPhone: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;

  updateProfile: (updates: Partial<User>) => void;
  updateProfileLocal: (updates: Partial<User>) => void;
  updateLanguage: (language: string) => void;
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;

  switchToPublisher: () => Promise<void>;
  checkPublisherEligibility: () => Promise<{
    eligible: boolean;
    missing_requirements: string[];
  }>;

  completeOnboarding: () => Promise<void>;
  clearError: () => void;
  isPublisher: () => boolean;
}

// ─── Error Handler ────────────────────────────────────────────────────────────

class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const handleAuthError = (error: any): AuthError => {
  if (
    error.message?.toLowerCase().includes('network') ||
    error.code === 'auth/network-request-failed'
  ) {
    return new AuthError(
      'Network connection failed. Please check your internet.',
      'NETWORK_ERROR'
    );
  }
  if (error.code === 'auth/too-many-requests') {
    return new AuthError(
      'Too many attempts. Please try again in a few minutes.',
      'TOO_MANY_REQUESTS'
    );
  }
  if (error.code === 'auth/invalid-verification-code') {
    return new AuthError('Invalid verification code. Please try again.', 'INVALID_CODE');
  }
  if (error.code === 'auth/code-expired') {
    return new AuthError(
      'Verification code expired. Please request a new one.',
      'CODE_EXPIRED'
    );
  }
  if (error.code === 'auth/credential-already-in-use') {
    return new AuthError(
      'This phone number is already linked to another account.',
      'CREDENTIAL_IN_USE'
    );
  }
  if (error.code === 'auth/provider-already-linked') {
    return new AuthError('This account is already linked.', 'ALREADY_LINKED');
  }
  return new AuthError(
    error.message || 'Authentication failed',
    error.code || 'UNKNOWN_ERROR'
  );
};

const checkNetwork = async (): Promise<void> => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new AuthError(
      'No internet connection. Please check your network.',
      'NO_NETWORK'
    );
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
      error: null,
      phoneConfirmation: null,
      pendingPhone: null,
      pendingVerificationId: null,
      lastOtpSentTime: null,

      // ─── Send Phone OTP ────────────────────────────────────────────────────

      sendPhoneOTP: async (phoneNumber: string) => {
        set({ error: null });

        const { lastOtpSentTime } = get();
        const now = Date.now();
        const RATE_LIMIT_MS = 30000;

        if (lastOtpSentTime && now - lastOtpSentTime < RATE_LIMIT_MS) {
          const remainingSeconds = Math.ceil(
            (RATE_LIMIT_MS - (now - lastOtpSentTime)) / 1000
          );
          throw new AuthError(
            `Please wait ${remainingSeconds} seconds before requesting a new code.`,
            'RATE_LIMITED'
          );
        }

        set({ isLoading: true });

        try {
          await checkNetwork();
          const confirmation = await firebaseSendOTP(phoneNumber);
          set({
            phoneConfirmation: confirmation,
            pendingPhone: phoneNumber,
            pendingVerificationId: confirmation.verificationId,
            lastOtpSentTime: now,
            isLoading: false,
          });
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      // ─── Verify Phone OTP ──────────────────────────────────────────────────

      verifyPhoneOTP: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await checkNetwork();

          const { phoneConfirmation, pendingVerificationId } = get();
          const session = phoneConfirmation || pendingVerificationId;

          if (!session) {
            throw new AuthError(
              'No OTP session found. Please request a new code.',
              'NO_SESSION'
            );
          }

          const firebaseToken = await firebaseVerifyOTP(session, otp);
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isAuthenticated: true,
            isOnboarded: !(response.user?.is_new_user ?? response.is_new_user),
            isLoading: false,
            phoneConfirmation: null,
            pendingPhone: null,
            pendingVerificationId: null,
            lastOtpSentTime: null,
          });

          return response;
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      // ─── Google Sign-In ────────────────────────────────────────────────────

      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          await checkNetwork();
          const firebaseToken = await firebaseGoogleSignIn(idToken);
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isAuthenticated: true,
            isOnboarded: !(response.user?.is_new_user ?? response.is_new_user),
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      // ─── Link Google Account ───────────────────────────────────────────────

      linkGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          await checkNetwork();
          const firebaseToken = await linkGoogleAccount(idToken);
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      // ─── Link Phone Number ─────────────────────────────────────────────────

      linkPhone: async (_phoneNumber: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await checkNetwork();

          const { pendingVerificationId } = get();
          if (!pendingVerificationId) {
            throw new AuthError('No verification session found', 'NO_SESSION');
          }

          const firebaseToken = await linkPhoneNumber(pendingVerificationId, otp);
          const response = await authApi.loginWithFirebase(firebaseToken);

          set({
            user: sanitizeUser(response.user),
            isLoading: false,
            pendingPhone: null,
            pendingVerificationId: null,
            lastOtpSentTime: null,
          });
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      // ─── Logout ────────────────────────────────────────────────────────────

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
            pendingPhone: null,
            pendingVerificationId: null,
            lastOtpSentTime: null,
          });
        }
      },

      // ─── Switch to Publisher ───────────────────────────────────────────────

      switchToPublisher: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.switchToPublisher();
          set((state) => ({
            user: state.user
              ? { ...state.user, role: 2, isPublisher: true }
              : null,
            isLoading: false,
          }));
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      checkPublisherEligibility: async () => {
        return await authApi.checkPublisherEligibility();
      },

      // ─── Profile Updates ───────────────────────────────────────────────────

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user
            ? sanitizeUser({ ...state.user, ...updates })
            : null,
        }));
      },

      updateProfileLocal: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user
            ? sanitizeUser({ ...state.user, ...updates })
            : null,
        }));
      },

      updateLanguage: (language: string) => {
        get().updateProfileLocal({ language });
      },

      updateTheme: (theme: 'light' | 'dark' | 'system') => {
        get().updateProfileLocal({ theme });
      },

      // ─── Complete Onboarding ───────────────────────────────────────────────

      completeOnboarding: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) throw new AuthError('No user found', 'NO_USER');

          let uploadedAvatarUrl: string | undefined = user.avatar;

          // ✅ Upload avatar to Supabase if local file
          if (
            user.avatar &&
            (user.avatar.startsWith('file://') ||
              user.avatar.startsWith('content://') ||
              (!user.avatar.startsWith('http://') &&
                !user.avatar.startsWith('https://')))
          ) {
            try {
              const { uploadImageToSupabase } = require('@/services/supabase');
              const { compressImage } = require('@/services/image');
              const compressed = await compressImage(user.avatar);
              uploadedAvatarUrl = await uploadImageToSupabase(compressed.uri);
            } catch (uploadErr) {
              console.error('Avatar upload failed:', uploadErr);
            }
          }

          // ✅ FIXED: Use UpdateMePayload type (not Partial<User>)
          const updatePayload: UpdateMePayload = {
            name: user.name ?? undefined,
            profile_picture: uploadedAvatarUrl ?? null,
            gender: user.gender ?? null,
            date_of_birth: user.date_of_birth ?? null,
          };

          await usersApi.updateMe(updatePayload);

          await usersApi.updatePreferences({
            language: user.language ?? null,
            state: user.state ?? null,
            district: user.district ?? null,
            interests: user.interests ?? null,
          });

          get().updateProfileLocal({
            avatar: uploadedAvatarUrl,
            profile_picture: uploadedAvatarUrl,
          });

          set({ isOnboarded: true, isLoading: false });
        } catch (error: any) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError.message });
          throw authError;
        }
      },

      clearError: () => set({ error: null }),
      isPublisher: () => (get().user?.role ?? 0) >= 2,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
        pendingPhone: state.pendingPhone,
        pendingVerificationId: state.pendingVerificationId,
      }),
    }
  )
);
