import { Stack, useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

export default function OnboardingLayout() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isOnboarded, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      if (pathname.includes('profile')) {
        return;
      }
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
    if (pathname.includes('profile')) {
      // Allow rendering the profile screen to verify email
    } else {
      return null;
    }
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