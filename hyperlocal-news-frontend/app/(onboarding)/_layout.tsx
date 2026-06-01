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
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (isOnboarded) {
      if (pathname.includes('profile')) {
        return;
      }
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isOnboarded, pathname]);

  if (!isAuthenticated) {
    return null;
  }

  if (isOnboarded) {
    if (pathname.includes('profile')) {
      // Allow rendering the profile screen to verify email
    } else {
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