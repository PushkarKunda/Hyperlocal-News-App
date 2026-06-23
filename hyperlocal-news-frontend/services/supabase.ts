import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra as any).supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (extra as any).supabaseAnonKey;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase client not fully configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const getSupabaseConfigStatus = () => ({
  isConfigured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
});
