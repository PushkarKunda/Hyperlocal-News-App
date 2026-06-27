// hooks/useGoogleFirebaseAuth.ts
import { useCallback, useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import { BackendLoginResponse } from '@/services/api';

interface ExpoConfig {
  extra?: {
    googleOAuth?: {
      webClientId?: string;
    };
  };
}

const expoConfig = Constants.expoConfig as ExpoConfig | null;
const webClientId =
  expoConfig?.extra?.googleOAuth?.webClientId ??
  '849371654758-oc0ne88p18ikcdamc7ns62ve8caa7n6e.apps.googleusercontent.com';

type UseGoogleFirebaseAuthOptions = {
  onSuccess?: (response: BackendLoginResponse) => void;
  onError?: (error: Error) => void;
};

export function useGoogleFirebaseAuth(options: UseGoogleFirebaseAuthOptions = {}) {
  const { loginWithGoogle, linkGoogle, isAuthenticated, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configure = async () => {
      try {
        await GoogleSignin.configure({
          webClientId,
          offlineAccess: false,
        });
        console.log('✅ Google Sign-In configured');
        setIsConfigured(true);
      } catch (error: any) {
        console.error('❌ Google Sign-In config error:', error.message);
      }
    };
    configure();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      console.warn('⚠️ Google Sign-In not configured yet');
      return;
    }

    setIsGoogleLoading(true);
    console.log('🚀 Starting Google Sign-In...');

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      let backendResponse;

      // ✅ FIXED: Properly handle linking vs new sign-in
      if (isAuthenticated) {
        console.log('🔗 Linking Google to existing account...');
        backendResponse = await linkGoogle(idToken);
      } else {
        console.log('🚀 New Google Sign-In...');
        backendResponse = await loginWithGoogle(idToken);
      }

      console.log('✅ Google auth successful');
      options.onSuccess?.(backendResponse);
    } catch (error: any) {
      console.error('❌ Google Sign-In failed:', error.message);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('🚫 User cancelled');
        return; // Silent cancel
      }

      options.onError?.(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isConfigured, isAuthenticated, loginWithGoogle, linkGoogle, options]);

  return {
    signInWithGoogle,
    isGoogleReady: isConfigured,
    isGoogleLoading: isGoogleLoading || isLoading,
  };
}