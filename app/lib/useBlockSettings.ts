import { useEffect, useState } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Block IDs ────────────────────────────────────────────────────────────────

export const BLOCK_IDS = [
  'Hero', 'Situation', 'Services', 'Cases', 'About',
  'Process', 'Calculator', 'Pricing', 'Reviews', 'FAQ',
  'ConsultationCTA', 'Contacts',
] as const;

export type BlockId = (typeof BLOCK_IDS)[number];

// ─── Per-block settings types ─────────────────────────────────────────────────

export interface CasesBlockSettings   { maxItems: number; showType: boolean; showYear: boolean }
export interface ReviewsBlockSettings { maxItems: number; showAddForm: boolean }
export interface FAQBlockSettings     { maxItems: number }
export interface ServicesBlockSettings{ maxItems: number }

export type AnyBlockSettings =
  | CasesBlockSettings
  | ReviewsBlockSettings
  | FAQBlockSettings
  | ServicesBlockSettings
  | Record<string, never>;

export const DEFAULT_BLOCK_SETTINGS: Record<BlockId, AnyBlockSettings> = {
  Hero:            {},
  Situation:       {},
  Services:        { maxItems: 9 } as ServicesBlockSettings,
  Cases:           { maxItems: 3, showType: true, showYear: true } as CasesBlockSettings,
  About:           {},
  Process:         {},
  Calculator:      {},
  Pricing:         {},
  Reviews:         { maxItems: 20, showAddForm: true } as ReviewsBlockSettings,
  FAQ:             { maxItems: 10 } as FAQBlockSettings,
  ConsultationCTA: {},
  Contacts:        {},
};

// ─── A/B test config ──────────────────────────────────────────────────────────

export interface ABVariant {
  label: string;
  settings?: Partial<AnyBlockSettings>;
}

export interface ABTest {
  id: string;
  name: string;
  blockId: BlockId;
  enabled: boolean;
  splitRatio: number; // 0-100, % for variant A
  variantA: ABVariant;
  variantB: ABVariant;
}

// ─── Full Firestore document: settings/blocks ─────────────────────────────────

export interface BlocksDocument {
  order: BlockId[];
  enabled: Partial<Record<BlockId, boolean>>;
  settings: Partial<Record<BlockId, AnyBlockSettings>>;
  abTests: ABTest[];
  updatedAt?: unknown;
}

// ─── Block metadata (for admin UI) ───────────────────────────────────────────

export interface BlockMeta {
  id: BlockId;
  label: string;
  funnel: 'AWARENESS' | 'INTEREST' | 'TRUST' | 'DESIRE' | 'OBJECTIONS' | 'ACTION';
  description: string;
  hasSettings: boolean;
}

export const BLOCK_CONFIG: BlockMeta[] = [
  { id: 'Hero',            label: 'Hero (Обкладинка)',             funnel: 'AWARENESS',  description: 'Перший екран із заголовком і CTA',               hasSettings: false },
  { id: 'Situation',       label: 'Знаємо ситуацію',              funnel: 'INTEREST',   description: 'Ідентифікація болю клієнта',                     hasSettings: false },
  { id: 'Services',        label: 'Компетенції / Послуги',        funnel: 'INTEREST',   description: 'Перелік юридичних послуг',                       hasSettings: true  },
  { id: 'Cases',           label: 'Анонімні кейси',               funnel: 'TRUST',      description: 'Реальні результати справ',                       hasSettings: true  },
  { id: 'About',           label: 'Про мене',                     funnel: 'TRUST',      description: 'Біографія адвоката',                             hasSettings: false },
  { id: 'Process',         label: 'Процес роботи',                funnel: 'DESIRE',     description: '4 кроки від дзвінка до результату',              hasSettings: false },
  { id: 'Calculator',      label: 'Калькулятор (Що присуджує суд)', funnel: 'DESIRE',   description: 'Інтерактивний калькулятор сум',                   hasSettings: false },
  { id: 'Pricing',         label: 'Вартість',                     funnel: 'DESIRE',     description: 'Прайс-лист пакетів',                             hasSettings: false },
  { id: 'Reviews',         label: 'Відгуки клієнтів',             funnel: 'TRUST',      description: 'Соціальний доказ перед CTA',                     hasSettings: true  },
  { id: 'FAQ',             label: 'Часті запитання (FAQ)',        funnel: 'OBJECTIONS', description: 'Зняття заперечень',                               hasSettings: true  },
  { id: 'ConsultationCTA', label: 'Заклик до консультації',       funnel: 'ACTION',     description: 'Головний CTA-блок',                              hasSettings: false },
  { id: 'Contacts',        label: 'Контакти / форма зв\'язку',    funnel: 'ACTION',     description: 'Форма з номером та контактами',                  hasSettings: false },
];

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_ORDER: BlockId[] = [...BLOCK_IDS];

export const DEFAULT_ENABLED: Record<BlockId, boolean> =
  BLOCK_IDS.reduce((a, id) => ({ ...a, [id]: true }), {} as Record<BlockId, boolean>);

export const DEFAULT_DOCUMENT: BlocksDocument = {
  order:    DEFAULT_ORDER,
  enabled:  DEFAULT_ENABLED,
  settings: DEFAULT_BLOCK_SETTINGS,
  abTests:  [],
};

// ─── Resolved runtime state for a single block ────────────────────────────────

export interface ResolvedBlock {
  id: BlockId;
  enabled: boolean;
  settings: AnyBlockSettings;
  activeVariant: 'A' | 'B' | null; // null = no A/B test running
  abTest?: ABTest;
}

/** Pick A/B variant deterministically per session via localStorage */
function resolveVariant(test: ABTest): 'A' | 'B' {
  const key = `ab_${test.id}`;
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  if (stored === 'A' || stored === 'B') return stored;
  const variant = Math.random() * 100 < test.splitRatio ? 'A' : 'B';
  if (typeof window !== 'undefined') localStorage.setItem(key, variant);
  return variant;
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export interface UseBlockSettingsReturn {
  /** Ordered list of resolved block states */
  resolved: ResolvedBlock[];
  /** Raw document (for admin editing) */
  document: BlocksDocument;
  loading: boolean;
}

export function useBlockSettings(): UseBlockSettingsReturn {
  const [document, setDocument] = useState<BlocksDocument>(DEFAULT_DOCUMENT);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsub = onSnapshot(
      doc(db, 'settings', 'blocks'),
      (snap) => {
        if (!mounted) return;
        if (snap.exists()) {
          const raw = snap.data() as Partial<BlocksDocument>;
          setDocument({
            order:    Array.isArray(raw.order) && raw.order.length ? raw.order : DEFAULT_ORDER,
            enabled:  { ...DEFAULT_ENABLED,        ...(raw.enabled  ?? {}) },
            settings: { ...DEFAULT_BLOCK_SETTINGS, ...(raw.settings ?? {}) },
            abTests:  Array.isArray(raw.abTests) ? raw.abTests : [],
          });
        } else {
          setDocument(DEFAULT_DOCUMENT);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('[useBlockSettings]', err.message);
        getDoc(doc(db, 'settings', 'blocks'))
          .then((snap) => {
            if (!mounted) return;
            if (snap.exists()) {
              const raw = snap.data() as Partial<BlocksDocument>;
              setDocument({
                order:    Array.isArray(raw.order) && raw.order.length ? raw.order : DEFAULT_ORDER,
                enabled:  { ...DEFAULT_ENABLED,        ...(raw.enabled  ?? {}) },
                settings: { ...DEFAULT_BLOCK_SETTINGS, ...(raw.settings ?? {}) },
                abTests:  Array.isArray(raw.abTests) ? raw.abTests : [],
              });
            }
          })
          .catch(() => {})
          .finally(() => { if (mounted) setLoading(false); });
      }
    );

    return () => { mounted = false; unsub(); };
  }, []);

  // Build resolved list in drag-and-drop order
  const resolved: ResolvedBlock[] = document.order.map((id) => {
    const abTest = document.abTests.find((t) => t.enabled && t.blockId === id);
    let activeVariant: 'A' | 'B' | null = null;
    let settings = (document.settings[id] ?? DEFAULT_BLOCK_SETTINGS[id] ?? {}) as AnyBlockSettings;

    if (abTest) {
      activeVariant = resolveVariant(abTest);
      if (activeVariant === 'B' && abTest.variantB.settings) {
        settings = { ...settings, ...abTest.variantB.settings } as AnyBlockSettings;
      }
    }

    return {
      id,
      enabled: document.enabled[id] ?? true,
      settings,
      activeVariant,
      abTest,
    };
  });

  return { resolved, document, loading };
}
