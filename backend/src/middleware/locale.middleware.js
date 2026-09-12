const SUPPORTED = ['en', 'bn'];

/**
 * Resolves the language to respond in and attaches it as `req.lang`.
 *
 * Resolution order:
 *   1. `X-App-Lang` header — sent by the frontend on every request, mirrors
 *      the citizen/admin's active UI language (see Frontend/src/api/axiosInstance.js).
 *   2. `Accept-Language` header, as a best-effort fallback for clients that
 *      don't set X-App-Lang (e.g. a raw API call).
 *   3. 'en'.
 *
 * Note: this runs before route-level `verifyAuth`, so it can't yet read a
 * logged-in user's saved `preferred_language` column (added in the Sprint 1
 * migration, used starting Sprint 3) — req.user isn't populated at this
 * point in the middleware chain. Once a controller has already loaded the
 * user record for its own purposes, it can prefer that stored value over
 * req.lang if the header was absent; that wiring lands in Sprint 3 alongside
 * the first real translated messages.
 */
export function resolveLocale(req, res, next) {
  const headerLang = (req.headers['x-app-lang'] || '').toLowerCase();
  if (SUPPORTED.includes(headerLang)) {
    req.lang = headerLang;
    return next();
  }

  const acceptLanguage = (req.headers['accept-language'] || '').toLowerCase();
  if (acceptLanguage.includes('bn')) {
    req.lang = 'bn';
    return next();
  }

  req.lang = 'en';
  next();
}
