import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extra = Constants.expoConfig?.extra ?? {};
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

/**
 * Uploads a local file URI to Supabase storage bucket and returns its public URL.
 */
export const uploadImageToSupabase = async (
  localUri: string,
  bucket = process.env.SUPABASE_BUCKET || 'news-images'
): Promise<string> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }

  try {
    // 1. Fetch local file URI and convert to blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    // 2. Generate a unique filepath
    const fileExt = localUri.split('.').pop() || 'jpg';
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const filePath = `avatars/${Date.now()}-${uniqueId}.${fileExt}`;

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // 4. Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to retrieve public URL from Supabase storage.');
    }

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Supabase Upload Error:', error);
    throw error;
  }
};
