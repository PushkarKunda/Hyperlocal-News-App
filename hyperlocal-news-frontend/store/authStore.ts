// store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'; // ✅ Added auth import
import {
  sendPhoneOTP as firebaseSendOTP,
  verifyPhoneOTP as firebaseVerifyOTP,
  signInWithGoogle as firebaseGoogleSignIn,
  firebaseSignOut,
  linkGoogleAccount,
  linkPhoneNumber,
} from '@/services/firebase';
import {
  authApi,
  BackendLoginResponse,
  PublisherEligibilityResponse,
  usersApi,
} from '@/services/api';
import type { UpdateMePayload } from '@/services/api/users';
import { clearTokens } from '@/services/api/token';
import { compressImage } from '@/services/image';
import { uploadImageToSupabase } from '@/services/supabase';

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
  category_ids?: number[];
  state?: string;
  district?: string;
  language_id?: number;
  state_id?: number;
  district_id?: number;
  city_id?: number;
  language_name?: string;
  state_name?: string;
  district_name?: string;
  city_name?: string;
  isPublisher?: boolean;
  gender?: string;
  date_of_birth?: string;
}

type RawUser = Omit<User, 'is_suspended' | 'created_at' | 'profile_picture'> & {
  is_suspended?: boolean;
  created_at?: string;
  role_name?: string;
  is_new_user?: boolean;
  profile_picture?: string | null;
  categories?: Array<{ id: number; name: string; slug?: string | null }>;
};

const sanitizeUser = (user: RawUser): User => {
  const isPhone = (str: string | null | undefined): boolean => {
    if (!str) return false;
    const clean = str.replace(/[\s\-()]/g, '');
    return /^\+?\d{7,15}$/.test(clean);
  };

  let updatedName = user.name;
  let updatedPhone = user.phone;

  if (isPhone(user.name)) {
    updatedName = null;
    if (!updatedPhone) updatedPhone = user.name;
  }

  const profilePicture = user.profile_picture ?? undefined;

  return {
    ...user,
    is_suspended: user.is_suspended ?? false,
    created_at: user.created_at ?? new Date().toISOString(),
    name: updatedName,
    phone: updatedPhone,
    phoneNumber: updatedPhone ?? undefined,
    mobile_verified: user.mobile_verified === true, // ✅ FIX: Trust backend, not phone existence
    isPublisher: user.role >= 2,
    avatar: profilePicture,
    profile_picture: profilePicture,
    language: user.language ?? user.language_name ?? undefined,
    state: user.state ?? user.state_name ?? undefined,
    district: user.district ?? user.district_name ?? undefined,
    interests: user.interests ?? undefined,
    category_ids: user.category_ids ?? user.categories?.map((category) => category.id),
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
  checkPublisherEligibility: () => Promise<PublisherEligibilityResponse>;

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

/**
 * ✅ FIX: Helper to detect "already linked" errors
 * Firebase returns auth/unknown with "already been linked" message
 * instead of auth/provider-already-linked in some RN Firebase versions
 */
const isAlreadyLinkedError = (error: any): boolean => {
  if (error.code === 'auth/provider-already-linked') return true;
  if (
    error.code === 'auth/unknown' &&
    error.message?.includes('already been linked')
  )
    return true;
  return false;
};

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
    return new AuthError(
      'Invalid verification code. Please try again.',
      'INVALID_CODE'
    );
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
  if (isAlreadyLinkedError(error)) {
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

      // ─── Verify Phone OTP (for phone-only login, NOT for linking) ──────────

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
      // ✅ FIX: Handles "already linked" as success
      // Called from edit-profile when authenticated user verifies phone

      linkPhone: async (_phoneNumber: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await checkNetwork();

          const { pendingVerificationId, pendingPhone } = get();
          if (!pendingVerificationId) {
            throw new AuthError('No verification session found', 'NO_SESSION');
          }

          let firebaseToken: string;
          let wasAlreadyLinked = false;

          try {
            // Normal flow: link phone credential to existing Firebase user
            firebaseToken = await linkPhoneNumber(
              pendingVerificationId,
              otp
            );
          } catch (linkError: any) {
            // ✅ FIX: "Already linked" means OTP was verified and phone is already linked
            // This is SUCCESS, not failure
            if (isAlreadyLinkedError(linkError)) {
              console.log(
                '📞 Phone already linked on Firebase — OTP verified successfully'
              );
              wasAlreadyLinked = true;

              // Get fresh ID token (includes phone claim) to sync with backend
              const currentUser = auth().currentUser;
              if (!currentUser) {
                throw new AuthError(
                  'No authenticated user found',
                  'NO_USER'
                );
              }
              firebaseToken = await currentUser.getIdToken(true);
            } else {
              // Other errors (invalid code, expired, credential-in-use) — re-throw
              throw linkError;
            }
          }

          // Sync with backend — backend reads Firebase token and updates user
          const response = await authApi.loginWithFirebase(firebaseToken);
          const updatedUser = sanitizeUser(response.user);

          // ✅ Safety: if backend didn't set mobile_verified, update phone explicitly
          // This handles the case where backend didn't sync from Firebase token
          if (!updatedUser.mobile_verified && pendingPhone) {
            try {
              console.log(
                '📞 Backend missing mobile_verified — updating phone explicitly'
              );
              await usersApi.updateMe({ phone: pendingPhone });
              updatedUser.phone = pendingPhone;
              updatedUser.phoneNumber = pendingPhone;
              updatedUser.mobile_verified = true;
            } catch (updateErr) {
              console.warn(
                '[linkPhone] Failed to update phone on backend:',
                updateErr
              );
            }
          }

          set({
            user: updatedUser,
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

      checkPublisherEligibility:
        async (): Promise<PublisherEligibilityResponse> => {
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

          const isLocalFile =
            user.avatar &&
            (user.avatar.startsWith('file://') ||
              user.avatar.startsWith('content://') ||
              (!user.avatar.startsWith('http://') &&
                !user.avatar.startsWith('https://')));

          if (isLocalFile && user.avatar) {
            try {
              const compressed = await compressImage(user.avatar, {
                width: 512,
                height: 512,
                compress: 0.8,
              });

              uploadedAvatarUrl = await uploadImageToSupabase(
                compressed.uri,
                'avatars'
              );
            } catch (uploadErr) {
              console.error(
                '[completeOnboarding] Avatar upload failed:',
                uploadErr
              );
              uploadedAvatarUrl = undefined;
            }
          }

          await usersApi.updateMe({
            name: user.name ?? undefined,
            profile_picture: uploadedAvatarUrl ?? null,
            gender: user.gender ?? null,
            date_of_birth: user.date_of_birth ?? null,
          });

          await usersApi.updatePreferences({
            language_id: user.language_id ?? null,
            state_id: user.state_id ?? null,
            district_id: user.district_id ?? null,
            city_id: user.city_id ?? null,
            category_ids: user.category_ids ?? null,
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