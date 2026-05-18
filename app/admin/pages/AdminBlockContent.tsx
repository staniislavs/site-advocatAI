import React, { useEffect, useState } from 'react';
import { FileEdit, Save, Loader2, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, Globe } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { cn } from '../../lib/utils';

// ─── Translation keys per block that can be edited in admin ──────────────────
const EDITABLE_FIELDS: Record<string, { label: string; key: string; multiline?: boolean }[]> = {
  Hero: [
    { label: 'Заголовок 1', key: 'hero.title_1' },
    { label: 'Заголовок 2 (курсив)', key: 'hero.title_2_italic' },
    { label: 'Опис', key: 'hero.description', multiline: true },
    { label: 'CTA кнопка', key: 'hero.cta_free' },
    { label: 'Роль (підзаголовок)', key: 'hero.role' },
    { label: 'Текст прокрутки', key: 'hero.scroll' },
  ],
  Situation: [
    { label: 'Тег розділу', key: 'situation.tag' },
    { label: 'Заголовок', key: 'situation.title' },
    { label: 'Заголовок курсив', key: 'situation.title_italic' },
    { label: 'Опис', key: 'situation.description', multiline: true },
  ],
  Services: [
    { label: 'Тег розділу', key: 'services.tag' },
    { label: 'Заголовок', key: 'services.title' },
    { label: 'Заголовок курсив', key: 'services.title_italic' },
    { label: 'Опис', key: 'services.description', multiline: true },
  ],
  Cases: [
    { label: 'Тег розділу', key: 'cases.tag' },
    { label: 'Заголовок', key: 'cases.title' },
    { label: 'Заголовок курсив', key: 'cases.title_italic' },
    { label: 'Опис', key: 'cases.description', multiline: true },
  ],
  About: [
    { label: 'Тег розділу', key: 'about.tag' },
    { label: 'Заголовок', key: 'about.title' },
    { label: 'Параграф 1', key: 'about.p1', multiline: true },
    { label: 'Параграф 2', key: 'about.p2', multiline: true },
    { label: 'Параграф 3', key: 'about.p3', multiline: true },
    { label: 'CTA кнопка', key: 'about.cta' },
  ],
  Process: [
    { label: 'Тег розділу', key: 'process.tag' },
    { label: 'Заголовок 1', key: 'process.title_1' },
    { label: 'Заголовок 2', key: 'process.title_2' },
    { label: 'Заголовок курсив', key: 'process.title_italic' },
  ],
  Calculator: [
    { label: 'Тег розділу', key: 'calculator.tag' },
    { label: 'Заголовок', key: 'calculator.title' },
    { label: 'Заголовок курсив', key: 'calculator.title_italic' },
    { label: 'Опис', key: 'calculator.description', multiline: true },
    { label: 'Інфо-підказка', key: 'calculator.form.info', multiline: true },
    { label: 'Заголовок placeholder', key: 'calculator.placeholder_title' },
    { label: 'Опис placeholder', key: 'calculator.placeholder_desc', multiline: true },
  ],
  Pricing: [
    { label: 'Тег розділу', key: 'pricing.tag' },
    { label: 'Заголовок', key: 'pricing.title' },
    { label: 'Заголовок курсив', key: 'pricing.title_italic' },
    { label: 'Опис', key: 'pricing.description', multiline: true },
  ],
  Reviews: [
    { label: 'Тег розділу', key: 'reviews.tag' },
    { label: 'Заголовок', key: 'reviews.title' },
    { label: 'Заголовок курсив', key: 'reviews.title_italic' },
    { label: 'CTA кнопка', key: 'reviews.cta' },
  ],
  FAQ: [
    { label: 'Тег розділу', key: 'faq.tag' },
    { label: 'Заголовок', key: 'faq.title' },
    { label: 'Заголовок курсив', key: 'faq.title_italic' },
  ],
  ConsultationCTA: [
    { label: 'Тег розділу', key: 'consultation.tag' },
    { label: 'Заголовок', key: 'consultation.title' },
    { label: 'Заголовок курсив', key: 'consultation.title_italic' },
    { label: 'Опис', key: 'consultation.description', multiline: true },
    { label: 'CTA кнопка', key: 'consultation.cta' },
  ],
  Contacts: [
    { label: 'Тег розділу', key: 'contacts.tag' },
    { label: 'Заголовок', key: 'contacts.title' },
    { label: 'Заголовок курсив', key: 'contacts.title_italic' },
    { label: 'Опис', key: 'contacts.description', multiline: true },
    { label: 'Кнопка форми', key: 'contacts.form.submit' },
    { label: 'Текст успіху', key: 'contacts.form.success', multiline: true },
    { label: 'Угода', key: 'contacts.form.agreement', multiline: true },
  ],
};

type Lang = 'uk' | 'en' | 'de' | 'ru';
const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'uk', label: 'Українська', flag: '🇺🇦' },
  { id: 'en', label: 'English',    flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { id: 'ru', label: 'Русский',    flag: '🇷🇺' },
];

/** Reads a dot-separated key from a nested object safely */
function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : '';
}

/** Sets a dot-separated key on a nested object (immutable) */
function setNestedValue(obj: Record<string, unknown>, key: string, value: string): Record<string, unknown> {
  const parts = key.split('.');
  const result = { ...obj };
  let cur: Record<string, unknown> = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const existing = cur[parts[i]];
    cur[parts[i]] = existing && typeof existing === 'object' ? { ...(existing as object) } : {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return result;
}

type ContentMap = Record<Lang, Record<string, unknown>>;

export default function AdminBlockContent() {
  const [content, setContent] = useState<ContentMap>({ uk: {}, en: {}, de: {}, ru: {} });
  const [loading, setLoading]  = useState(true);
  const [saving, setSaving]    = useState(false);
  const [dirty, setDirty]      = useState(false);
  const [savedAt, setSavedAt]  = useState<Date | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>('uk');
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(['Hero']));

  // Load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'blockContent'));
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data() as Partial<ContentMap>;
          setContent({
            uk: (data.uk ?? {}) as Record<string, unknown>,
            en: (data.en ?? {}) as Record<string, unknown>,
            de: (data.de ?? {}) as Record<string, unknown>,
            ru: (data.ru ?? {}) as Record<string, unknown>,
          });
        }
      } catch (err) {
        console.warn('[AdminBlockContent]', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const updateField = (key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [activeLang]: setNestedValue(prev[activeLang], key, value),
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'blockContent'),
        { ...content, updatedAt: serverTimestamp() },
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

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      next.has(blockId) ? next.delete(blockId) : next.add(blockId);
      return next;
    });
  };

  const clearOverride = (key: string) => {
    setContent((prev) => {
      const lang = prev[activeLang];
      const parts = key.split('.');
      // Remove the key
      const updated = setNestedValue(lang, key, '');
      return { ...prev, [activeLang]: updated };
    });
    setDirty(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#141414]/40" size={32} /></div>;
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
            <p className="text-sm text-[#141414]/55 max-w-lg">
              Тексти, введені тут, перекривають i18n-переклади на сайті.
              Порожнє поле = використовується дефолтний переклад.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { setContent({ uk: {}, en: {}, de: {}, ru: {} }); setDirty(true); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#141414]/15 rounded-lg text-sm text-[#141414]/65 hover:bg-white transition">
              <RotateCcw size={13} /> Очистити всі
            </button>
            <button onClick={handleSave} disabled={!dirty || saving}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition',
                dirty ? 'bg-[#141414] text-white hover:bg-[#141414]/85' : 'bg-[#141414]/10 text-[#141414]/35 cursor-not-allowed')}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        {/* Status */}
        {(dirty || savedAt) && (
          <div className={cn('flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-6',
            dirty ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>
            {dirty ? '● Є незбережені зміни' : <><CheckCircle2 size={15} /> Збережено о {savedAt?.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</>}
          </div>
        )}

        {/* Language tabs */}
        <div className="flex gap-2 mb-6">
          {LANGS.map((l) => (
            <button key={l.id} onClick={() => setActiveLang(l.id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition',
                activeLang === l.id ? 'bg-[#141414] text-white' : 'bg-white border border-[#141414]/10 text-[#141414]/65 hover:bg-[#141414]/5')}>
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {Object.entries(EDITABLE_FIELDS).map(([blockId, fields]) => {
            const isOpen = expandedBlocks.has(blockId);
            const hasOverrides = fields.some((f) => getNestedValue(content[activeLang], f.key) !== '');

            return (
              <div key={blockId} className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden">
                {/* Block header */}
                <button
                  onClick={() => toggleBlock(blockId)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#fafafa] transition"
                >
                  <span className="font-medium text-[#141414]">{blockId}</span>
                  {hasOverrides && (
                    <span className="text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      OVERRIDES
                    </span>
                  )}
                  <Globe size={13} className="ml-1 text-[#141414]/30" />
                  <span className="text-xs text-[#141414]/40">{LANGS.find((l) => l.id === activeLang)?.flag}</span>
                  <div className="ml-auto text-[#141414]/30">{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                </button>

                {/* Fields */}
                {isOpen && (
                  <div className="border-t border-[#141414]/8 px-5 py-5 space-y-5">
                    {fields.map((field) => {
                      const val = getNestedValue(content[activeLang], field.key);
                      return (
                        <div key={field.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] uppercase tracking-widest text-[#141414]/50 font-medium">
                              {field.label}
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#141414]/25">{field.key}</span>
                              {val && (
                                <button onClick={() => clearOverride(field.key)}
                                  className="text-[10px] text-rose-400 hover:text-rose-600 hover:underline">
                                  Очистити
                                </button>
                              )}
                            </div>
                          </div>
                          {field.multiline ? (
                            <textarea
                              rows={3}
                              value={val}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              placeholder="(дефолтний переклад — залишіть порожнім)"
                              className="w-full border border-[#141414]/15 rounded-xl px-4 py-3 text-sm text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none placeholder:text-[#141414]/30"
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              placeholder="(дефолтний переклад — залишіть порожнім)"
                              className="w-full border border-[#141414]/15 rounded-xl px-4 py-3 text-sm text-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] placeholder:text-[#141414]/30"
                            />
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
          💡 Зміни активуються для всіх відвідувачів одразу після збереження. Порожні поля = стандартний переклад з файлів.
        </p>
      </div>
    </div>
  );
}
