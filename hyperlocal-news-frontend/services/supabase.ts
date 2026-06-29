import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────────────────────────

const extra = Constants.expoConfig?.extra ?? {};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra as any).supabaseUrl;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (extra as any).supabaseAnonKey;

// ✅ FIXED: Must have EXPO_PUBLIC_ prefix to work in Expo
const supabaseBucket =
  process.env.EXPO_PUBLIC_SUPABASE_BUCKET ?? 'news-images';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

// ─── Client ───────────────────────────────────────────────────────────────────

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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UploadImageResult {
  publicUrl: string;
  filePath: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a compressed local URI to Supabase Storage
 * Returns the public URL to send to backend
 *
 * Flow:
 * compressImage(uri) → uploadImageToSupabase(compressed.uri) → publicUrl
 * → PATCH /user/user/users/me { profile_picture: publicUrl }
 */
export const uploadImageToSupabase = async (
  localUri: string,
  folder = 'avatars',
  bucket = supabaseBucket
): Promise<string> => {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[Supabase] Client is not configured. Check your .env file.'
    );
  }

  // 1. Fetch local file and convert to blob
  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error(`[Supabase] Failed to read local file: ${localUri}`);
  }

  const blob = await response.blob();

  // 2. Build unique file path
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const filePath = `${folder}/${uniqueId}.${ext}`;

  // 3. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('[Supabase] Upload error:', uploadError);
    throw new Error(`[Supabase] Upload failed: ${uploadError.message}`);
  }

  // 4. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('[Supabase] Failed to get public URL after upload.');
  }

  return publicUrlData.publicUrl;
};

export const getSupabaseConfigStatus = () => ({
  isConfigured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  bucket: supabaseBucket,
});