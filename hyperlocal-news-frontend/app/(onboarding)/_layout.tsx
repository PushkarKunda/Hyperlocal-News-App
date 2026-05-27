import { Stack, useRouter, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function OnboardingLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isOnboarded, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      router.replace('/(tabs)');
    } else if (isAuthenticated) {
      const isAllowedPath = 
        pathname.includes('complete') || 
        pathname.includes('setup-feed') || 
        pathname.includes('profile');
        
      if (!isAllowedPath) {
        if (user?.name) {
          router.replace('/(onboarding)/complete');
        } else {
          router.replace('/(onboarding)/profile');
        }
      }
    }
  }, [isAuthenticated, isOnboarded, pathname, user]);

  if (isAuthenticated && isOnboarded) {
    return null;
  }

  if (isAuthenticated) {
    const isAllowedPath = 
      pathname.includes('complete') || 
      pathname.includes('setup-feed') || 
      pathname.includes('profile');
      
    if (!isAllowedPath) {
      return null;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="language" />
      <Stack.Screen name="location" />
      <Stack.Screen name="districts" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="setup-feed" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}