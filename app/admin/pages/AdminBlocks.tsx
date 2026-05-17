import React, { useEffect, useState } from 'react';
import { Layers, Save, Loader2, Eye, EyeOff, ExternalLink, Edit3, RotateCcw, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useNavigate } from 'react-router';
import { BLOCK_CONFIG, DEFAULT_BLOCKS, BlocksSettings, BlockId } from '../../lib/useBlockSettings';
import { cn } from '../../lib/utils';

/**
 * Maps a block id to a section anchor on the public homepage.
 * If the section has an id (anchor) we link directly to it; otherwise we link to /uk.
 */
const BLOCK_ANCHORS: Partial<Record<BlockId, string>> = {
  Hero: 'hero',
  Contacts: 'kontakty',
};

/**
 * Maps a block id to a translation namespace in public/locales/*.
 * Used to deep-link the "Edit content" action — for now they all open the route + a hint.
 */
const BLOCK_I18N_NS: Record<BlockId, string> = {
  Hero: 'hero',
  Situation: 'situation',
  Services: 'services',
  Cases: 'cases',
  About: 'about',
  Process: 'process',
  Calculator: 'calculator',
  Pricing: 'pricing',
  Reviews: 'reviews',
  FAQ: 'faq',
  ConsultationCTA: 'consultation',
  Contacts: 'contacts',
};

const FUNNEL_COLORS: Record<string, string> = {
  AWARENESS:  'bg-blue-50 text-blue-700 border-blue-200',
  INTEREST:   'bg-amber-50 text-amber-700 border-amber-200',
  TRUST:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  DESIRE:     'bg-violet-50 text-violet-700 border-violet-200',
  OBJECTIONS: 'bg-rose-50 text-rose-700 border-rose-200',
  ACTION:     'bg-[#141414] text-white border-[#141414]',
};

export default function AdminBlocks() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<BlocksSettings>(DEFAULT_BLOCKS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Load current settings
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'blocks'));
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data() as Partial<BlocksSettings>;
          setBlocks({ ...DEFAULT_BLOCKS, ...data });
        }
      } catch (err) {
        console.warn('[AdminBlocks] load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggle = (id: BlockId) => {
    setBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
  };

  const enableAll = () => {
    setBlocks(DEFAULT_BLOCKS);
    setDirty(true);
  };

  const resetToSaved = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'blocks'));
      if (snap.exists()) {
        setBlocks({ ...DEFAULT_BLOCKS, ...(snap.data() as Partial<BlocksSettings>) });
      } else {
        setBlocks(DEFAULT_BLOCKS);
      }
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'blocks'),
        { ...blocks, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSavedAt(new Date());
      setDirty(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/blocks');
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = Object.values(blocks).filter(Boolean).length;

  const openOnSite = (id: BlockId) => {
    const anchor = BLOCK_ANCHORS[id];
    const url = anchor ? `/uk#${anchor}` : '/uk';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const editContent = (id: BlockId) => {
    // For Services / Pricing / Cases — these have admin pages already
    if (id === 'Services' || id === 'Cases' || id === 'Pricing') {
      navigate('/admin/seo'); // could route per-block if dedicated pages exist
      return;
    }
    if (id === 'Contacts') {
      navigate('/admin/email');
      return;
    }
    // For text blocks (translations) — show hint
    alert(`Текст блоку "${id}" редагується через i18n переклади.\n\nНамеспейс: ${BLOCK_I18N_NS[id]}\nФайли: public/locales/{uk,en,de,ru}/translation.json\n\n(Окрема admin-сторінка для редагування текстів буде додана пізніше)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#141414]/40" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Layers className="text-[#141414]" size={28} />
              <h1 className="text-3xl font-serif text-[#141414]">Блоки сайту</h1>
            </div>
            <p className="text-sm text-[#141414]/60">
              Керуйте видимістю та налаштуваннями секцій на головній сторінці.
              Зміни застосовуються миттєво після збереження.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetToSaved}
              disabled={!dirty || saving}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#141414]/15 rounded-lg text-sm text-[#141414]/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <RotateCcw size={14} />
              Скасувати
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition",
                dirty
                  ? "bg-[#141414] text-white hover:bg-[#141414]/90"
                  : "bg-[#141414]/10 text-[#141414]/40 cursor-not-allowed"
              )}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#141414]/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-[#141414]/40 mb-1">Видимих блоків</p>
            <p className="text-3xl font-serif text-[#141414]">{visibleCount} / {BLOCK_CONFIG.length}</p>
          </div>
          <div className="bg-white border border-[#141414]/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-[#141414]/40 mb-1">Статус</p>
            <p className={cn("text-sm font-medium flex items-center gap-2",
              dirty ? "text-amber-600" : "text-emerald-600"
            )}>
              {dirty ? '● Незбережені зміни' : (
                <>
                  <CheckCircle2 size={16} />
                  {savedAt ? `Збережено о ${savedAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : 'Збережено'}
                </>
              )}
            </p>
          </div>
          <div className="bg-white border border-[#141414]/10 rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-[#141414]/40 mb-1">Швидкі дії</p>
            <button
              onClick={enableAll}
              className="text-sm text-[#141414] hover:underline"
            >
              Увімкнути всі →
            </button>
          </div>
        </div>

        {/* Blocks list */}
        <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#141414]/8 bg-[#fcfcfc]">
            <p className="text-xs uppercase tracking-widest text-[#141414]/40 font-medium">
              Порядок блоків на головній сторінці (маркетингова воронка AIDA)
            </p>
          </div>
          <div className="divide-y divide-[#141414]/8">
            {BLOCK_CONFIG.map((block, idx) => {
              const enabled = blocks[block.id];
              return (
                <div
                  key={block.id}
                  className={cn(
                    "flex items-center gap-4 px-6 py-5 transition",
                    enabled ? "bg-white" : "bg-[#fafafa] opacity-70"
                  )}
                >
                  {/* Position */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-xs font-mono text-[#141414]/30">{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-[#141414] text-base">{block.label}</h3>
                      <span className={cn(
                        "text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-medium",
                        FUNNEL_COLORS[block.funnel] || 'bg-gray-50 text-gray-600 border-gray-200'
                      )}>
                        {block.funnel}
                      </span>
                      <span className="text-[10px] text-[#141414]/30 font-mono">{block.id}</span>
                    </div>
                    <p className="text-xs text-[#141414]/55">{block.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => editContent(block.id)}
                      title="Редагувати контент"
                      className="p-2 text-[#141414]/40 hover:text-[#141414] hover:bg-[#141414]/5 rounded-lg transition"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => openOnSite(block.id)}
                      title="Переглянути на сайті"
                      className="p-2 text-[#141414]/40 hover:text-[#141414] hover:bg-[#141414]/5 rounded-lg transition"
                    >
                      <ExternalLink size={15} />
                    </button>

                    {/* Toggle switch */}
                    <label className="relative inline-flex items-center cursor-pointer ml-3" title={enabled ? 'Вимкнути блок' : 'Увімкнути блок'}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggle(block.id)}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        "w-12 h-6 rounded-full transition-all duration-200 relative",
                        enabled ? "bg-emerald-500" : "bg-[#141414]/15"
                      )}>
                        <div className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                          enabled ? "translate-x-6" : "translate-x-0"
                        )} />
                      </div>
                      <span className={cn(
                        "ml-3 text-xs font-medium w-12",
                        enabled ? "text-emerald-600" : "text-[#141414]/30"
                      )}>
                        {enabled ? (
                          <span className="flex items-center gap-1"><Eye size={12} /> ON</span>
                        ) : (
                          <span className="flex items-center gap-1"><EyeOff size={12} /> OFF</span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-[#141414]/40 mt-6 text-center">
          💡 Порада: вимкнення Hero або Contacts суттєво вплине на конверсію. Hero — перше враження, Contacts — головна форма заявок.
        </p>
      </div>
    </div>
  );
}
