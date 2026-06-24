// services/api/config.ts
const parseTimeout = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const cleaned = value.replace(/[\r\n\t ]/g, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const API_CONFIG = {
  baseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/[\r\n\t ]/g, '').trim() || 'https://hypernews-production.up.railway.app',
  timeoutMs: parseTimeout(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 60000),
};