/**
 * Loads Firestore content overrides (settings/blockContent) and injects them
 * into the active i18next resource bundle so all existing t() calls use the
 * overridden values — without any changes to existing components.
 *
 * Called ONCE at the top of HomePage.
 */
import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from './firebase';

interface ContentDocument {
  [lang: string]: Record<string, unknown>;
}

export function useContentOverride(): void {
  const { i18n } = useTranslation();
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'blockContent'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as ContentDocument;
        // For each language that has overrides, deep-merge into the resource bundle
        const langs = ['uk', 'en', 'de', 'ru'] as const;
        langs.forEach((lang) => {
          const overrides = data[lang];
          if (!overrides || typeof overrides !== 'object') return;
          // addResourceBundle(lang, ns, resources, deep, overwrite)
          i18n.addResourceBundle(lang, 'translation', overrides, true, true);
        });
      },
      (err) => {
        // Offline / permission — silently ignore, i18n fallback works
        console.warn('[useContentOverride] snapshot failed:', err.message);
      }
    );
    unsubRef.current = unsub;
    return () => { unsub(); };
  }, [i18n]);
}
