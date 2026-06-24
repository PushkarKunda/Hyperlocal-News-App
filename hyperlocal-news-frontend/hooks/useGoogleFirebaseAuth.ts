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
  const { loginWithGoogle, isLoading } = useAuthStore();
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
      console.log('✅ Google Play Services available');

      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful');
      console.log('👤 User:', userInfo.data?.user?.email);

      const idToken = userInfo.data?.idToken;
      console.log('🔑 ID Token received:', !!idToken);

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('🚀 Calling backend loginWithGoogle...');
      const backendResponse = await loginWithGoogle(idToken);
      console.log('✅ Backend login successful');

      options.onSuccess?.(backendResponse);
    } catch (error: any) {
      console.error('❌ Google Sign-In failed:', error.message);
      console.error('❌ Error code:', error.code);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('🚫 User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('⏳ Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('❌ Google Play Services not available');
      }

      options.onError?.(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isConfigured, loginWithGoogle, options]);

  return {
    signInWithGoogle,
    isGoogleReady: isConfigured,
    isGoogleLoading: isGoogleLoading || isLoading,
  };
}

// import { useCallback, useEffect, useState } from 'react';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import Constants from 'expo-constants';
// import { useAuthStore } from '@/store/authStore';
// import { BackendLoginResponse } from '@/services/api';

// interface ExpoConfig { extra?: { googleOAuth?: { webClientId?: string } } }
// const webClientId = (Constants.expoConfig as ExpoConfig | null)?.extra?.googleOAuth?.webClientId ?? '849371654758-oc0ne88p18ikcdamc7ns62ve8caa7n6e.apps.googleusercontent.com';

// type UseGoogleFirebaseAuthOptions = { onSuccess?: (response: BackendLoginResponse) => void; onError?: (error: Error) => void; };

// export function useGoogleFirebaseAuth(options: UseGoogleFirebaseAuthOptions = {}) {
//   const { loginWithGoogle, isLoading } = useAuthStore();
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);

//   useEffect(() => {
//     GoogleSignin.configure({ webClientId, offlineAccess: false });
//   }, []);

//   const signInWithGoogle = useCallback(async () => {
//     setIsGoogleLoading(true);
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       const idToken = userInfo.data?.idToken;
//       if (!idToken) throw new Error('No ID token received');
//       const backendResponse = await loginWithGoogle(idToken);
//       options.onSuccess?.(backendResponse);
//     } catch (error: any) {
//       if (error.code !== statusCodes.SIGN_IN_CANCELLED) options.onError?.(error);
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   }, [loginWithGoogle, options]);

//   return { signInWithGoogle, isGoogleReady: true, isGoogleLoading: isGoogleLoading || isLoading };
// }