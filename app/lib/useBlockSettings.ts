import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Order matches HomePage rendering (AIDA marketing funnel).
 * Used both in admin (settings UI) and on the site (rendering decisions).
 */
export const BLOCK_CONFIG = [
  { id: 'Hero',             label: 'Hero (Головна обкладинка)',    funnel: 'AWARENESS',  description: 'Перший екран із заголовком і CTA' },
  { id: 'Situation',        label: 'Знаємо ситуацію',              funnel: 'INTEREST',   description: 'Ідентифікація болю клієнта' },
  { id: 'Services',         label: 'Компетенції / Послуги',        funnel: 'INTEREST',   description: 'Перелік юридичних послуг' },
  { id: 'Cases',            label: 'Анонімні кейси',               funnel: 'TRUST',      description: 'Реальні результати справ' },
  { id: 'About',            label: 'Про мене',                     funnel: 'TRUST',      description: 'Біографія адвоката' },
  { id: 'Process',          label: 'Процес роботи',                funnel: 'DESIRE',     description: '4 кроки від дзвінка до результату' },
  { id: 'Calculator',       label: 'Що присуджує суд (Калькулятор)', funnel: 'DESIRE',   description: 'Інтерактивний калькулятор сум' },
  { id: 'Pricing',          label: 'Вартість',                     funnel: 'DESIRE',     description: 'Прайс-лист пакетів' },
  { id: 'Reviews',          label: 'Відгуки клієнтів',             funnel: 'TRUST',      description: 'Соціальний доказ перед CTA' },
  { id: 'FAQ',              label: 'Часті запитання (FAQ)',        funnel: 'OBJECTIONS', description: 'Зняття заперечень' },
  { id: 'ConsultationCTA',  label: 'Заклик до консультації',       funnel: 'ACTION',     description: 'Главний CTA-блок' },
  { id: 'Contacts',         label: 'Контакти / форма зв\'язку',    funnel: 'ACTION',     description: 'Форма з номером та контактами' },
] as const;

export type BlockId = (typeof BLOCK_CONFIG)[number]['id'];

export type BlocksSettings = Record<BlockId, boolean>;

/** Defaults — all blocks enabled. Order is canonical. */
export const DEFAULT_BLOCKS: BlocksSettings = BLOCK_CONFIG.reduce(
  (acc, b) => ({ ...acc, [b.id]: true }),
  {} as BlocksSettings
);

/**
 * Reactive hook: subscribes to Firestore `settings/blocks` and returns the live map.
 * If the document is missing or there is no connection — returns DEFAULT_BLOCKS.
 */
export function useBlockSettings(): { blocks: BlocksSettings; loading: boolean } {
  const [blocks, setBlocks] = useState<BlocksSettings>(DEFAULT_BLOCKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Try real-time subscription
    const unsub = onSnapshot(
      doc(db, 'settings', 'blocks'),
      (snap) => {
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data() as Partial<BlocksSettings>;
          setBlocks({ ...DEFAULT_BLOCKS, ...data });
        } else {
          setBlocks(DEFAULT_BLOCKS);
        }
        setLoading(false);
      },
      (err) => {
        // Permissions/offline — fall back to one-shot read, then defaults
        console.warn('[useBlockSettings] subscription failed:', err.message);
        getDoc(doc(db, 'settings', 'blocks'))
          .then((snap) => {
            if (!mounted) return;
            if (snap.exists()) {
              const data = snap.data() as Partial<BlocksSettings>;
              setBlocks({ ...DEFAULT_BLOCKS, ...data });
            }
          })
          .catch(() => { /* ignore */ })
          .finally(() => mounted && setLoading(false));
      }
    );

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return { blocks, loading };
}
