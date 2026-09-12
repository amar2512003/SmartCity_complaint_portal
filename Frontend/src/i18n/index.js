// i18next bootstrap.
//
// Sprint 1 scope: wiring only. The `common` namespace carries one smoke-test
// key (`app.name`) so the setup can be verified end-to-end; page-level copy
// gets extracted into `citizen` / `admin` namespaces in later sprints.
//
// Language resolution order (via i18next-browser-languagedetector):
//   1. `sc_lang` key in localStorage (set by the LanguageToggle component)
//   2. the browser's `navigator.language`
//   3. fallback: 'en'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enCitizen from './locales/en/citizen.json';
import enAdmin from './locales/en/admin.json';
import bnCommon from './locales/bn/common.json';
import bnCitizen from './locales/bn/citizen.json';
import bnAdmin from './locales/bn/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, citizen: enCitizen, admin: enAdmin },
      bn: { common: bnCommon, citizen: bnCitizen, admin: bnAdmin },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn'],
    ns: ['common', 'citizen', 'admin'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'sc_lang',
      caches: ['localStorage'],
      lookupLocalStorageKey: 'sc_lang',
    },
    interpolation: { escapeValue: false }, // React already escapes.
  });

// Keep <html lang="..."> in sync for accessibility/SEO, including on the
// very first load (the languageChanged event doesn't fire for the initial
// language, only on subsequent changes).
document.documentElement.lang = i18n.resolvedLanguage || 'en';
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
