import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export function useAppColorScheme() {
  const systemColorScheme = useColorScheme();
  const { user } = useAuthStore();

  const activeTheme = 
    user?.theme === 'dark' ? 'dark' : 
    user?.theme === 'light' ? 'light' : 
    systemColorScheme;

  return activeTheme || 'light';
}
