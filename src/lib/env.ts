/**
 * Tarayıcı ve sunucu tarafında kullanılacak Supabase public anahtarını döndürür.
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` tercih edilir, geriye dönük uyumluluk için
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` de desteklenir.
 */
export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

/**
 * Mapbox erişim anahtarını döndürür.
 * Yeni `.env` adı `NEXT_PUBLIC_MAPBOX_TOKEN` olup eski anahtar da desteklenir.
 */
export function getMapboxPublicToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
}

/**
 * Uygulamanın public origin bilgisini döndürür.
 */
export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Placeholder değerlerin gerçek ortam gibi davranmasını engeller.
 */
function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length > 0 &&
    (normalized === "placeholder" ||
      normalized.startsWith("placeholder-") ||
      normalized.includes("placeholder.supabase.co") ||
      normalized.includes("your-project.supabase.co") ||
      normalized.includes("sb_publishable_xxx") ||
      normalized.includes("sb_secret_xxx"))
  );
}

/**
 * Public tarafta Supabase istemcisi kurulabilecek kadar ortam değişkeni olup olmadığını kontrol eder.
 */
export function hasPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = getSupabaseAnonKey();

  return Boolean(
    supabaseUrl &&
      supabaseKey &&
      !isPlaceholderValue(supabaseUrl) &&
      !isPlaceholderValue(supabaseKey)
  );
}
