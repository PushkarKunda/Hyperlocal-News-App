import {
  useFonts,
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
import { Text, StyleSheet, Appearance } from 'react-native';
import { useAuthStore } from '@/store/authStore';

// Global text interceptor to support app-wide dynamic text scaling and Poppins font family enforcement
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

      let injectedStyle: any = {};
      const flatStyle = props && props.style ? StyleSheet.flatten(props.style) : null;

      // 1. Handle dynamic text scaling
      if (scale !== 1.0 && flatStyle && typeof flatStyle.fontSize === 'number') {
        injectedStyle.fontSize = flatStyle.fontSize * scale;
      }

      // 2. Handle global Google Fonts Poppins enforcement
      const family = flatStyle?.fontFamily;
      if (!family || family === 'System' || family === 'sans-serif' || family === 'normal') {
        const weight = flatStyle?.fontWeight;
        const weightStr = weight ? String(weight) : '';
        
        if (weightStr === 'bold' || weightStr === '700' || weightStr === '800' || weightStr === '900') {
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
    // Map Inter font names to Poppins equivalents
    'Inter_400Regular': Poppins_400Regular,
    'Inter_500Medium': Poppins_500Medium,
    'Inter_600SemiBold': Poppins_600SemiBold,
    'Inter_700Bold': Poppins_700Bold,

    // Map Newsreader font names to Poppins equivalents
    'Newsreader_400Regular': Poppins_400Regular,
    'Newsreader_500Medium': Poppins_500Medium,
    'Newsreader_600SemiBold': Poppins_600SemiBold,
    'Newsreader_700Bold': Poppins_700Bold,
    'Newsreader_400Regular_Italic': Poppins_400Regular,

    // Load Poppins fonts
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

useEffect(() => {
  Appearance.setColorScheme(colorScheme ?? 'light');
}, [colorScheme]);
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
          <Stack.Screen name="news/[id]" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}