import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { updatePreferredLanguage } from '../api/citizenAuth.api';

// Persistence note: i18next-browser-languagedetector is configured (see
// src/i18n/index.js) with `caches: ['localStorage']` and
// `lookupLocalStorageKey: 'sc_lang'`, so calling changeLanguage() here
// already writes the choice to the same 'sc_lang' key that
// api/axiosInstance.js reads to set the X-App-Lang header. No manual
// localStorage call needed in this component.
//
// For a logged-in citizen, also persist the choice to their `preferred_language`
// DB column (PATCH /auth/citizen/preferred-language) so it follows them to
// other devices/browsers too — see AuthContext.login(), which reads this
// same field back on sign-in. Admins have no such column/endpoint, so this
// is skipped for the admin role.
export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { user } = useAuth() || {};
  const current = i18n.resolvedLanguage || 'en';

  const setLang = (lng) => {
    if (lng === current) return;
    i18n.changeLanguage(lng);
    if (user?.role === 'citizen') {
      updatePreferredLanguage(lng).catch(() => {
        // Non-fatal: the UI has already switched language locally via
        // localStorage; only the cross-device sync silently fails here.
      });
    }
  };

  return (
    <div className="lang-toggle" role="group" aria-label="Language / ভাষা">
      <button
        type="button"
        className={current === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={current === 'bn' ? 'active' : ''}
        onClick={() => setLang('bn')}
      >
        বাং
      </button>
    </div>
  );
}
