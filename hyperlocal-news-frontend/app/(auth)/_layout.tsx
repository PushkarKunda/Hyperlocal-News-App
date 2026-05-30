import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { isAuthenticated, isOnboarded, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        if (user?.name) {
          router.replace('/(onboarding)/complete');
        } else {
          router.replace('/(onboarding)/profile');
        }
      }
    }
  }, [isAuthenticated, isOnboarded, user]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}