import React, { useEffect, useState, useCallback } from 'react';
import {
  FileEdit, Save, Loader2, RotateCcw, ChevronDown, ChevronUp,
  CheckCircle2, RefreshCw, Eye
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ─── Editable fields per block ───────────────────────────────────────────────
const EDITABLE_FIELDS: Record<string, { label: string; key: string; multiline?: boolean }[]> = {
  Hero: [
    { label: 'Заголовок 1',          key: 'hero.title_1' },
    { label: 'Заголовок 2 (курсив)', key: 'hero.title_2_italic' },
    { label: 'Опис',                 key: 'hero.description',    multiline: true },
    { label: 'CTA кнопка',           key: 'hero.cta_free' },
    { label: 'Роль (підзаголовок)',   key: 'hero.role' },
    { label: 'Текст прокрутки',      key: 'hero.scroll' },
  ],
  Situation: [
    { label: 'Тег розділу',    key: 'situation.tag' },
    { label: 'Заголовок',      key: 'situation.title' },
    { label: 'Курсив',         key: 'situation.title_italic' },
    { label: 'Опис',           key: 'situation.description', multiline: true },
  ],
  Services: [
    { label: 'Тег розділу',    key: 'services.tag' },
    { label: 'Заголовок',      key: 'services.title' },
    { label: 'Курсив',         key: 'services.title_italic' },
    { label: 'Опис',           key: 'services.description',  multiline: true },
  ],
  Cases: [
    { label: 'Тег розділу',    key: 'cases.tag' },
    { label: 'Заголовок',      key: 'cases.title' },
    { label: 'Курсив',         key: 'cases.title_italic' },
    { label: 'Опис',           key: 'cases.description',     multiline: true },
  ],
  About: [
    { label: 'Тег розділу',    key: 'about.tag' },
    { label: 'Заголовок',      key: 'about.title' },
    { label: 'Параграф 1',     key: 'about.p1',              multiline: true },
    { label: 'Параграф 2',     key: 'about.p2',              multiline: true },
    { label: 'Параграф 3',     key: 'about.p3',              multiline: true },
    { label: 'CTA кнопка',     key: 'about.cta' },
  ],
  Process: [
    { label: 'Тег розділу',    key: 'process.tag' },
    { label: 'Заголовок 1',    key: 'process.title_1' },
    { label: 'Заголовок 2',    key: 'process.title_2' },
    { label: 'Курсив',         key: 'process.title_italic' },
  ],
  Calculator: [
    { label: 'Тег розділу',         key: 'calculator.tag' },
    { label: 'Заголовок',           key: 'calculator.title' },
    { label: 'Курсив',              key: 'calculator.title_italic' },
    { label: 'Опис',                key: 'calculator.description',        multiline: true },
    { label: 'Інфо-підказка',       key: 'calculator.form.info',          multiline: true },
    { label: 'Заголовок пустого',   key: 'calculator.placeholder_title' },
    { label: 'Опис пустого',        key: 'calculator.placeholder_desc',   multiline: true },
  ],
  Pricing: [
    { label: 'Тег розділу',    key: 'pricing.tag' },
    { label: 'Заголовок',      key: 'pricing.title' },
    { label: 'Курсив',         key: 'pricing.title_italic' },
    { label: 'Опис',           key: 'pricing.description',   multiline: true },
  ],
  Reviews: [
    { label: 'Тег розділу',    key: 'reviews.tag' },
    { label: 'Заголовок',      key: 'reviews.title' },
    { label: 'Курсив',         key: 'reviews.title_italic' },
    { label: 'CTA кнопка',     key: 'reviews.cta' },
    { label: 'Заголовок модалки', key: 'reviews.modal.title' },
    { label: 'Підзаголовок модалки', key: 'reviews.modal.subtitle' },
    { label: 'Кнопка надіслати', key: 'reviews.modal.submit' },
    { label: 'Дякуємо заголовок', key: 'reviews.modal.thanks_title' },
    { label: 'Дякуємо текст', key: 'reviews.modal.thanks_subtitle', multiline: true },
  ],
  FAQ: [
    { label: 'Тег розділу',    key: 'faq.tag' },
    { label: 'Заголовок',      key: 'faq.title' },
    { label: 'Курсив',         key: 'faq.title_italic' },
  ],
  ConsultationCTA: [
    { label: 'Тег розділу',    key: 'consultation.tag' },
    { label: 'Заголовок',      key: 'consultation.title' },
    { label: 'Курсив',         key: 'consultation.title_italic' },
    { label: 'Опис',           key: 'consultation.description', multiline: true },
    { label: 'CTA кнопка',     key: 'consultation.cta' },
  ],
  Contacts: [
    { label: 'Тег розділу',    key: 'contacts.tag' },
    { label: 'Заголовок',      key: 'contacts.title' },
    { label: 'Курсив',         key: 'contacts.title_italic' },
    { label: 'Опис',           key: 'contacts.description',    multiline: true },
    { label: 'Кнопка форми',   key: 'contacts.form.submit' },
    { label: 'Текст успіху',   key: 'contacts.form.success',   multiline: true },
    { label: 'Угода',          key: 'contacts.form.agreement', multiline: true },
  ],
};

type Lang = 'uk' | 'en' | 'de' | 'ru';
const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'uk', label: 'Українська', flag: '🇺🇦' },
  { id: 'en', label: 'English',    flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { id: 'ru', label: 'Русский',    flag: '🇷🇺' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read a dot-path from a nested object */
function getDeep(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce<unknown>((cur, key) => {
    if (cur && typeof cur === 'object') return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? '';
}

/** Write a dot-path into a nested object (immutable) */
function setDeep(obj: Record<string, unknown>, path: string, value: string): Record<string, unknown> {
  const parts = path.split('.');
  const clone = { ...obj };
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const existing = cur[parts[i]];
    cur[parts[i]] = existing && typeof existing === 'object' ? { ...(existing as object) } : {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return clone;
}

type TranslationsMap = Record<Lang, Record<string, unknown>>;
type OverridesMap    = Record<Lang, Record<string, unknown>>;

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminBlockContent() {
  // Base translations fetched from public JSON files
  const [base, setBase]       = useState<TranslationsMap>({ uk: {}, en: {}, de: {}, ru: {} });
  // User overrides saved in Firestore
  const [overrides, setOverrides] = useState<OverridesMap>({ uk: {}, en: {}, de: {}, ru: {} });

  const [loading, setLoading]  = useState(true);
  const [saving, setSaving]    = useState(false);
  const [dirty, setDirty]      = useState(false);
  const [savedAt, setSavedAt]  = useState<Date | null>(null);
  const [activeLang, setActiveLang]     = useState<Lang>('uk');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Hero']));

  // ── Load base translations + Firestore overrides ──────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      // 1. Fetch all 4 locale JSON files in parallel
      const langs: Lang[] = ['uk', 'en', 'de', 'ru'];
      const jsonResults = await Promise.all(
        langs.map((lang) =>
          fetch(`/locales/${lang}/translation.json`)
            .then((r) => r.json())
            .catch(() => ({}))
        )
      );
      const baseMap: TranslationsMap = {
        uk: jsonResults[0], en: jsonResults[1],
        de: jsonResults[2], ru: jsonResults[3],
      };

      // 2. Fetch Firestore overrides
      let overridesMap: OverridesMap = { uk: {}, en: {}, de: {}, ru: {} };
      try {
        const snap = await getDoc(doc(db, 'settings', 'blockContent'));
        if (snap.exists()) {
          const data = snap.data() as Partial<OverridesMap>;
          overridesMap = {
            uk: (data.uk ?? {}) as Record<string, unknown>,
            en: (data.en ?? {}) as Record<string, unknown>,
            de: (data.de ?? {}) as Record<string, unknown>,
            ru: (data.ru ?? {}) as Record<string, unknown>,
          };
        }
      } catch (err) {
        console.warn('[AdminBlockContent] Firestore load:', err);
      }

      if (!mounted) return;
      setBase(baseMap);
      setOverrides(overridesMap);
      setLoading(false);
    };

    loadAll();
    return () => { mounted = false; };
  }, []);

  // ── Get value for a field: override > base ────────────────────────────────
  const getValue = useCallback((lang: Lang, key: string): string => {
    const ov = getDeep(overrides[lang], key);
    if (ov) return ov;
    return getDeep(base[lang], key);
  }, [overrides, base]);

  /** True if the field has a Firestore override (differs from base) */
  const isOverridden = useCallback((lang: Lang, key: string): boolean => {
    const ov = getDeep(overrides[lang], key);
    return Boolean(ov && ov !== getDeep(base[lang], key));
  }, [overrides, base]);

  // ── Update a field ────────────────────────────────────────────────────────
  const updateField = (key: string, value: string) => {
    const baseVal = getDeep(base[activeLang], key);
    setOverrides((prev) => ({
      ...prev,
      // If value matches base, remove the override (store empty = use base)
      [activeLang]: setDeep(prev[activeLang], key, value === baseVal ? '' : value),
    }));
    setDirty(true);
  };

  /** Restore a single field to its base (JSON) value */
  const restoreField = (key: string) => {
    setOverrides((prev) => ({
      ...prev,
      [activeLang]: setDeep(prev[activeLang], key, ''),
    }));
    setDirty(true);
  };

  /** Restore ALL fields for the active language */
  const restoreAll = () => {
    setOverrides((prev) => ({ ...prev, [activeLang]: {} }));
    setDirty(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'blockContent'),
        { ...overrides, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSavedAt(new Date());
      setDirty(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/blockContent');
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Count overridden fields for the active language
  const overrideCount = Object.entries(EDITABLE_FIELDS).reduce((sum, [, fields]) =>
    sum + fields.filter((f) => isOverridden(activeLang, f.key)).length, 0);

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#141414]/40" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileEdit size={26} className="text-[#141414]" />
              <h1 className="text-3xl font-serif text-[#141414]">Редактор текстів</h1>
            </div>
            <p className="text-sm text-[#141414]/55 max-w-xl">
              Редагуйте тексти прямо в полях. Змінені поля підсвічуються кольором.
              Натисніть ↺ щоб повернути оригінал. Порожнє поле = використовується оригінал.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={restoreAll}
              disabled={overrideCount === 0 || saving}
              title="Скасувати всі зміни для цієї мови"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#141414]/15 rounded-lg text-sm text-[#141414]/65 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <RotateCcw size={13} /> Скасувати
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition',
                dirty
                  ? 'bg-[#141414] text-white hover:bg-[#141414]/85'
                  : 'bg-[#141414]/10 text-[#141414]/35 cursor-not-allowed'
              )}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {dirty ? (
            <span className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
              ● Є незбережені зміни
            </span>
          ) : savedAt ? (
            <span className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
              <CheckCircle2 size={14} />
              Збережено о {savedAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          {overrideCount > 0 && (
            <span className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
              <Eye size={14} />
              {overrideCount} змінених полів ({LANGS.find(l => l.id === activeLang)?.flag})
            </span>
          )}
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {LANGS.map((l) => {
            const count = Object.entries(EDITABLE_FIELDS).reduce((sum, [, fields]) =>
              sum + fields.filter((f) => isOverridden(l.id, f.key)).length, 0);
            return (
              <button
                key={l.id}
                onClick={() => setActiveLang(l.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition',
                  activeLang === l.id
                    ? 'bg-[#141414] text-white'
                    : 'bg-white border border-[#141414]/10 text-[#141414]/65 hover:bg-[#141414]/5'
                )}
              >
                <span>{l.flag}</span>
                {l.label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    activeLang === l.id
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-700'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-5 text-xs text-[#141414]/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-[#141414]/15 inline-block" />
            Оригінал (з файлу перекладу)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" />
            Змінено (збережено у Firestore)
          </span>
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {Object.entries(EDITABLE_FIELDS).map(([blockId, fields]) => {
            const isOpen = expanded.has(blockId);
            const blockOverrides = fields.filter((f) => isOverridden(activeLang, f.key)).length;

            return (
              <div
                key={blockId}
                className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden"
              >
                {/* Block header */}
                <button
                  onClick={() => toggleBlock(blockId)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#fafafa] transition"
                >
                  <span className="font-medium text-[#141414]">{blockId}</span>
                  <span className="text-xs text-[#141414]/40">
                    {fields.length} {fields.length === 1 ? 'поле' : 'поля'}
                  </span>
                  {blockOverrides > 0 && (
                    <span className="text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      {blockOverrides} змінено
                    </span>
                  )}
                  <div className="ml-auto text-[#141414]/30">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Fields */}
                {isOpen && (
                  <div className="border-t border-[#141414]/8 divide-y divide-[#141414]/6">
                    {fields.map((field) => {
                      const current   = getValue(activeLang, field.key);
                      const baseVal   = getDeep(base[activeLang], field.key);
                      const overridden = isOverridden(activeLang, field.key);

                      return (
                        <div
                          key={field.key}
                          className={cn(
                            'px-5 py-5 transition-colors',
                            overridden ? 'bg-amber-50/60' : 'bg-white'
                          )}
                        >
                          {/* Field header */}
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-widest text-[#141414]/50 font-semibold">
                                {field.label}
                              </span>
                              {overridden && (
                                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                  ЗМІНЕНО
                                </span>
                              )}
                            </label>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-[#141414]/25 hidden md:block">
                                {field.key}
                              </span>
                              {overridden && (
                                <button
                                  onClick={() => restoreField(field.key)}
                                  title="Повернути оригінал"
                                  className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-800 hover:underline"
                                >
                                  <RefreshCw size={11} /> Оригінал
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Input */}
                          {field.multiline ? (
                            <textarea
                              rows={3}
                              value={current}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              className={cn(
                                'w-full border rounded-xl px-4 py-3 text-sm text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none transition-colors',
                                overridden
                                  ? 'border-amber-300 bg-white focus:ring-amber-400'
                                  : 'border-[#141414]/15 bg-white'
                              )}
                            />
                          ) : (
                            <input
                              type="text"
                              value={current}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              className={cn(
                                'w-full border rounded-xl px-4 py-3 text-sm text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] transition-colors',
                                overridden
                                  ? 'border-amber-300 bg-white focus:ring-amber-400'
                                  : 'border-[#141414]/15 bg-white'
                              )}
                            />
                          )}

                          {/* Show original value if overridden */}
                          {overridden && baseVal && (
                            <p className="mt-1.5 text-xs text-[#141414]/40 flex items-start gap-1">
                              <span className="font-medium flex-shrink-0">Оригінал:</span>
                              <span className="italic truncate">{baseVal}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#141414]/35 mt-6 text-center">
          💡 Зміни активуються для всіх відвідувачів одразу після збереження.
          Порожнє поле або відновлений оригінал = стандартний переклад із JSON-файлів.
        </p>
      </div>
    </div>
  );
}
