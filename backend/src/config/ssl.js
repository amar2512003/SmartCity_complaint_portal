// Supabase (and most managed Postgres providers) require SSL, but a local
// `postgresql://localhost...` dev database usually doesn't support it.
// Enable SSL automatically for any non-local connection string.
export function pgSslConfig(connectionString) {
  if (!connectionString) return false;
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  if (isLocal) return false;
  return { rejectUnauthorized: false };
}
