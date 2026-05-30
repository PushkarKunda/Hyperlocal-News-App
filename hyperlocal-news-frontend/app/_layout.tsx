import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { 
  Newsreader_400Regular, 
  Newsreader_500Medium, 
  Newsreader_600SemiBold, 
  Newsreader_700Bold,
  Newsreader_400Regular_Italic
} from '@expo-google-fonts/newsreader';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { Colors } from '@/constants/Colors';
import { Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';

// Global text size interceptor to support app-wide dynamic text scaling
const originalTextRender = (Text as any).render;
if (originalTextRender) {
  (Text as any).render = function (props: any, ref: any) {
    let newProps = props;
    try {
      const user = useAuthStore.getState().user;
      const size = user?.textSize || 'medium';
      const scale = 
        size === 'small' ? 0.85 :
        size === 'large' ? 1.2 :
        1.0;

      if (scale !== 1.0 && props && props.style) {
        const flatStyle = StyleSheet.flatten(props.style);
        if (flatStyle && typeof flatStyle.fontSize === 'number') {
          newProps = {
            ...props,
            style: [props.style, { fontSize: flatStyle.fontSize * scale }],
          };
        }
      }
    } catch (e) {
      console.warn('Error in global text scaling:', e);
    }
    return originalTextRender.call(this, newProps, ref);
  };
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();
  const textSize = user?.textSize || 'medium';

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Newsreader_400Regular,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    Newsreader_700Bold,
    Newsreader_400Regular_Italic,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={colors.statusBar} translucent backgroundColor="transparent" />
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
          <Stack.Screen name="(publisher)" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="news" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}