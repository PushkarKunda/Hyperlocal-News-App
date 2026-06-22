import { useCallback, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '@/store/authStore';
import { BackendLoginResponse } from '@/services/api';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface ExpoConfig {
  extra?: {
    googleOAuth?: {
      webClientId?: string;
      iosClientId?: string;
      androidClientId?: string;
    };
  };
}

const expoConfig = Constants.expoConfig as ExpoConfig | null;
const extra = expoConfig?.extra ?? {};
const googleOAuth = extra.googleOAuth ?? {};

const webClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  googleOAuth.webClientId ??
  '849371654758-oc0ne88p18ikcdamc7ns62ve8caa7n6e.apps.googleusercontent.com';

const iosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
  googleOAuth.iosClientId ??
  '849371654758-jb831p3e0mv4n8bupaep4cu691ifbpr5.apps.googleusercontent.com';

const androidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ??
  googleOAuth.androidClientId ??
  webClientId;

type UseGoogleFirebaseAuthOptions = {
  onSuccess?: (response: BackendLoginResponse) => void;
  onError?: (error: Error) => void;
};

export function useGoogleFirebaseAuth(options: UseGoogleFirebaseAuthOptions = {}) {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // const proxyRedirectUri = AuthSession.makeRedirectUri({
  //   useProxy: true,
  // });
  const redirectUri = "https://auth.expo.io/@22mh1a0529/hyperlocal-news";

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: webClientId,
      webClientId,
      iosClientId,
      androidClientId,
      selectAccount: true,
      redirectUri: redirectUri,

    },
    {
      scheme: 'hyperlocalnews'
    }
  );

  useEffect(() => {
    if (request) {
      console.log('🔍 Manual forced Redirect URI:', request.redirectUri);
    }
  }, [request]);  //This is just for testing, remove it for production

  useEffect(() => {
    if (!response) return;

    const finishGoogleSignIn = async () => {
      if (response.type !== 'success') {
        setIsGoogleLoading(false);
        return;
      }

      const idToken =
        response.params.id_token ??
        (response as any).authentication?.idToken;

      if (!idToken) {
        const error = new Error('Google did not return an ID token.');
        options.onError?.(error);
        setIsGoogleLoading(false);
        return;
      }

      try {
        const backendResponse = await loginWithGoogle(idToken);
        options.onSuccess?.(backendResponse);
      } catch (error: any) {
        options.onError?.(error);
      } finally {
        setIsGoogleLoading(false);
      }
    };

    finishGoogleSignIn();
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error: any) {
      setIsGoogleLoading(false);
      options.onError?.(error);
    }
  }, [promptAsync, options]);

  return {
    signInWithGoogle,
    isGoogleReady: !!request,
    isGoogleLoading: isGoogleLoading || isLoading,
  };
}
