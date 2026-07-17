import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

// ─── Config ──────────────────────────────────────────────────────────────────

const extra = Constants.expoConfig?.extra ?? {};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra as any).supabaseUrl;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (extra as any).supabaseAnonKey;

// FIXED: Must have EXPO_PUBLIC_ prefix to work in Expo
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
function decodeBase64(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const base64_0 = lookup[base64.charCodeAt(i)];
    const base64_1 = lookup[base64.charCodeAt(i + 1)];
    const base64_2 = lookup[base64.charCodeAt(i + 2)];
    const base64_3 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (base64_0 << 2) | (base64_1 >> 4);
    if (base64_2 !== 64 && p < bufferLength) {
      bytes[p++] = ((base64_1 & 15) << 4) | (base64_2 >> 2);
    }
    if (base64_3 !== 64 && p < bufferLength) {
      bytes[p++] = ((base64_2 & 3) << 6) | base64_3;
    }
  }

  return arrayBuffer;
}

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

  // 1. Read local file as base64 using ImageManipulator
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [],
    { base64: true }
  );

  if (!result.base64) {
    throw new Error(`[Supabase] Failed to read base64 from file: ${localUri}`);
  }

  const arrayBuffer = decodeBase64(result.base64);

  // 2. Build unique file path
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const filePath = `${folder}/${uniqueId}.${ext}`;

  // 3. Upload to Supabase Storage using ArrayBuffer to bypass RN Blob fetch bug
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
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

//Just for testing
console.log(getSupabaseConfigStatus());