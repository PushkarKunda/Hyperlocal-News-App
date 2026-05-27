import { useAuthStore } from '@/store/authStore';

export function useAppTextScale() {
  const { user } = useAuthStore();
  const size = user?.textSize || 'medium';
  
  if (size === 'small') return 0.85;
  if (size === 'large') return 1.2;
  return 1.0;
}
