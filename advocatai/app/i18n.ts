import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uk from '../public/locales/uk/translation.json';

const SUPPORTED = ['uk', 'en', 'de', 'ru'] as const;

if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init({
    resources: { uk: { translation: uk } },
    fallbackLng: 'uk',
    lng: 'uk',
    supportedLngs: SUPPORTED as unknown as string[],
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    react: { useSuspense: false },
  });

const loaded = new Set<string>(['uk']);

export async function ensureLanguage(lng: string) {
  if (loaded.has(lng) || !SUPPORTED.includes(lng as any)) return;
  const data = await import(`../public/locales/${lng}/translation.json`);
  i18n.addResourceBundle(lng, 'translation', (data as any).default ?? data, true, true);
  loaded.add(lng);
}

export default i18n;
