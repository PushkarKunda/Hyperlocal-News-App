import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { Colors } from '@/constants/Colors';
import { Text, StyleSheet, Appearance } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/useStore';
import { checkFirebaseConnection } from '@/services/firebase';
import '../services/firebase';

// ─── Global Text Interceptor ──────────────────────────────────────────────────
// Enforces Poppins font family and dynamic text scaling app-wide
const originalTextRender = (Text as any).render;
if (originalTextRender) {
  (Text as any).render = function (props: any, ref: any) {
    let newProps = props;
    try {
      const user = useAuthStore.getState().user;
      const size = 'medium';
      const scale =
        size === 'medium' ? 1.0 :
          size === 'large' ? 1.2 :
            1.0;

      let injectedStyle: any = {};
      const flatStyle = props && props.style
        ? StyleSheet.flatten(props.style)
        : null;

      // 1. Handle dynamic text scaling
      if (
        scale !== 1.0 &&
        flatStyle &&
        typeof flatStyle.fontSize === 'number'
      ) {
        injectedStyle.fontSize = flatStyle.fontSize * scale;
      }

      // 2. Handle global Poppins font enforcement
      const family = flatStyle?.fontFamily;
      if (
        !family ||
        family === 'System' ||
        family === 'sans-serif' ||
        family === 'normal'
      ) {
        const weight = flatStyle?.fontWeight;
        const weightStr = weight ? String(weight) : '';

        if (
          weightStr === 'bold' ||
          weightStr === '700' ||
          weightStr === '800' ||
          weightStr === '900'
        ) {
          injectedStyle.fontFamily = 'Poppins_700Bold';
        } else if (weightStr === '600') {
          injectedStyle.fontFamily = 'Poppins_600SemiBold';
        } else if (weightStr === '500') {
          injectedStyle.fontFamily = 'Poppins_500Medium';
        } else {
          injectedStyle.fontFamily = 'Poppins_400Regular';
        }
      }

      if (Object.keys(injectedStyle).length > 0) {
        newProps = {
          ...props,
          style: [props.style, injectedStyle],
        };
      }
    } catch (e) {
      console.warn('Error in global text interceptor:', e);
    }
    return originalTextRender.call(this, newProps, ref);
  };
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
SplashScreen.preventAutoHideAsync();

// ─── React Query Client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // ✅ Firebase connection check - correctly placed inside component
  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  // Hide splash screen when fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Apply theme from user preferences
  useEffect(() => {
    const theme = useAuthStore.getState().user?.theme;
    if (theme === 'dark' || theme === 'light') {
      Appearance.setColorScheme(theme);
    } else {
      Appearance.setColorScheme(null);
    }
  }, [colorScheme]);

  useEffect(() => {
    if (isAuthenticated) {
      void useStore.getState().loadUser();
    } else {
      useStore.getState().setUser(null);
    }
  }, [isAuthenticated]);

  // Wait for fonts before rendering
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          style={colors.statusBar}
          translucent
          backgroundColor="transparent"
        />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(publisher)"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen name="news/[id]" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}