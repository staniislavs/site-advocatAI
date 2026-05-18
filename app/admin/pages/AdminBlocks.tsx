import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Layers, Save, Loader2, Eye, EyeOff, GripVertical,
  Settings2, ChevronDown, ChevronUp, FlaskConical,
  RotateCcw, CheckCircle2, ExternalLink, FileEdit, Plus, Trash2,
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useNavigate } from 'react-router';
import {
  BLOCK_CONFIG, BlockId, BlocksDocument, ABTest,
  DEFAULT_DOCUMENT, DEFAULT_BLOCK_SETTINGS,
  CasesBlockSettings, ReviewsBlockSettings, FAQBlockSettings, ServicesBlockSettings,
} from '../../lib/useBlockSettings';
import { cn } from '../../lib/utils';

// ─── Funnel colors ────────────────────────────────────────────────────────────
const FUNNEL_COLORS: Record<string, string> = {
  AWARENESS:  'bg-blue-50 text-blue-700 border-blue-200',
  INTEREST:   'bg-amber-50 text-amber-700 border-amber-200',
  TRUST:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  DESIRE:     'bg-violet-50 text-violet-700 border-violet-200',
  OBJECTIONS: 'bg-rose-50 text-rose-700 border-rose-200',
  ACTION:     'bg-[#141414] text-white border-[#141414]',
};

const ANCHORS: Partial<Record<BlockId, string>> = { Hero: 'hero', Contacts: 'kontakty' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2); }

// ─── Sortable row ─────────────────────────────────────────────────────────────
interface SortableRowProps {
  id: BlockId;
  idx: number;
  enabled: boolean;
  expanded: boolean;
  abActive: boolean;
  onToggleEnabled: (id: BlockId) => void;
  onToggleExpand: (id: BlockId) => void;
  onOpenSite: (id: BlockId) => void;
  onEditContent: (id: BlockId) => void;
  children?: React.ReactNode;
}

function SortableRow({
  id, idx, enabled, expanded, abActive,
  onToggleEnabled, onToggleExpand, onOpenSite, onEditContent, children,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = BLOCK_CONFIG.find((b) => b.id === id)!;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b border-[#141414]/8 last:border-0 transition-shadow',
        isDragging ? 'shadow-lg bg-white z-50' : enabled ? 'bg-white' : 'bg-[#fafafa]'
      )}
    >
      {/* Main row */}
      <div className={cn('flex items-center gap-3 px-5 py-4', !enabled && 'opacity-60')}>
        {/* Drag handle */}
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-[#141414]/25 hover:text-[#141414]/60 touch-none">
          <GripVertical size={18} />
        </button>

        {/* Number */}
        <span className="text-xs font-mono text-[#141414]/30 w-6 flex-shrink-0">
          {String(idx + 1).padStart(2, '0')}
        </span>

        {/* Info */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-medium text-sm text-[#141414]">{meta.label}</span>
            <span className={cn('text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-semibold', FUNNEL_COLORS[meta.funnel])}>
              {meta.funnel}
            </span>
            {abActive && (
              <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                A/B
              </span>
            )}
          </div>
          <p className="text-xs text-[#141414]/45 truncate">{meta.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEditContent(id)} title="Редагувати текст" className="p-2 text-[#141414]/35 hover:text-[#141414] hover:bg-[#141414]/5 rounded-lg transition">
            <FileEdit size={14} />
          </button>
          <button onClick={() => onOpenSite(id)} title="Переглянути на сайті" className="p-2 text-[#141414]/35 hover:text-[#141414] hover:bg-[#141414]/5 rounded-lg transition">
            <ExternalLink size={14} />
          </button>
          {meta.hasSettings && (
            <button onClick={() => onToggleExpand(id)} title="Налаштування" className={cn('p-2 rounded-lg transition', expanded ? 'bg-[#141414]/8 text-[#141414]' : 'text-[#141414]/35 hover:text-[#141414] hover:bg-[#141414]/5')}>
              {expanded ? <ChevronUp size={14} /> : <Settings2 size={14} />}
            </button>
          )}

          {/* Toggle */}
          <label className="relative inline-flex items-center cursor-pointer ml-2">
            <input type="checkbox" className="sr-only peer" checked={enabled} onChange={() => onToggleEnabled(id)} />
            <div className={cn('w-11 h-6 rounded-full relative transition-all duration-200', enabled ? 'bg-emerald-500' : 'bg-[#141414]/15')}>
              <div className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', enabled ? 'translate-x-5' : 'translate-x-0')} />
            </div>
          </label>
        </div>
      </div>

      {/* Expanded settings panel */}
      {expanded && meta.hasSettings && (
        <div className="px-14 pb-5 pt-1 bg-[#fafafa] border-t border-[#141414]/6">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Per-block settings panels ────────────────────────────────────────────────
function CasesSettingsPanel({
  value, onChange,
}: { value: CasesBlockSettings; onChange: (v: CasesBlockSettings) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Макс. кейсів</label>
        <input type="number" min={1} max={3} value={value.maxItems}
          onChange={(e) => onChange({ ...value, maxItems: Number(e.target.value) })}
          className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]" />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={value.showType} onChange={(e) => onChange({ ...value, showType: e.target.checked })} className="w-4 h-4 accent-[#141414]" />
          Тип справи
        </label>
      </div>
      <div className="flex items-end gap-2 pb-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={value.showYear} onChange={(e) => onChange({ ...value, showYear: e.target.checked })} className="w-4 h-4 accent-[#141414]" />
          Рік
        </label>
      </div>
    </div>
  );
}

function ReviewsSettingsPanel({
  value, onChange,
}: { value: ReviewsBlockSettings; onChange: (v: ReviewsBlockSettings) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Макс. відгуків</label>
        <input type="number" min={1} max={50} value={value.maxItems}
          onChange={(e) => onChange({ ...value, maxItems: Number(e.target.value) })}
          className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]" />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" checked={value.showAddForm} onChange={(e) => onChange({ ...value, showAddForm: e.target.checked })} className="w-4 h-4 accent-[#141414]" />
          Форма додавання
        </label>
      </div>
    </div>
  );
}

function FAQSettingsPanel({
  value, onChange,
}: { value: FAQBlockSettings; onChange: (v: FAQBlockSettings) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-3 max-w-xs">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Макс. питань</label>
        <input type="number" min={1} max={20} value={value.maxItems}
          onChange={(e) => onChange({ ...value, maxItems: Number(e.target.value) })}
          className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]" />
      </div>
    </div>
  );
}

function ServicesSettingsPanel({
  value, onChange,
}: { value: ServicesBlockSettings; onChange: (v: ServicesBlockSettings) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-3 max-w-xs">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Макс. послуг</label>
        <input type="number" min={1} max={9} value={value.maxItems}
          onChange={(e) => onChange({ ...value, maxItems: Number(e.target.value) })}
          className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]" />
      </div>
    </div>
  );
}

// ─── A/B Tests tab ────────────────────────────────────────────────────────────
function ABTestsPanel({
  abTests, onChange,
}: { abTests: ABTest[]; onChange: (tests: ABTest[]) => void }) {
  const addTest = () => {
    const newTest: ABTest = {
      id: uid(),
      name: 'Новий A/B тест',
      blockId: 'Hero',
      enabled: false,
      splitRatio: 50,
      variantA: { label: 'Контрольна (A)' },
      variantB: { label: 'Тест (B)', settings: {} },
    };
    onChange([...abTests, newTest]);
  };

  const updateTest = (idx: number, patch: Partial<ABTest>) => {
    const updated = [...abTests];
    updated[idx] = { ...updated[idx], ...patch };
    onChange(updated);
  };

  const removeTest = (idx: number) => {
    onChange(abTests.filter((_, i) => i !== idx));
  };

  const resetVariant = (testId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`ab_${testId}`);
      alert('Варіант для поточного браузера скинуто. Перезавантажте сторінку.');
    }
  };

  return (
    <div className="space-y-4">
      {abTests.length === 0 && (
        <div className="text-center py-12 text-[#141414]/40 text-sm">
          Немає A/B тестів. Створіть перший, щоб порівняти варіанти блоків.
        </div>
      )}
      {abTests.map((test, idx) => (
        <div key={test.id} className="border border-[#141414]/10 rounded-xl overflow-hidden">
          {/* Test header */}
          <div className="flex items-center gap-3 p-4 bg-[#fafafa] border-b border-[#141414]/8">
            <FlaskConical size={16} className="text-purple-500 flex-shrink-0" />
            <input
              className="flex-grow text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
              value={test.name}
              onChange={(e) => updateTest(idx, { name: e.target.value })}
              placeholder="Назва тесту"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => resetVariant(test.id)} title="Скинути варіант" className="text-xs text-[#141414]/40 hover:text-[#141414] px-2 py-1 rounded hover:bg-[#141414]/5 transition">
                Скинути варіант
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={test.enabled}
                  onChange={(e) => updateTest(idx, { enabled: e.target.checked })} />
                <div className={cn('w-9 h-5 rounded-full relative transition-all', test.enabled ? 'bg-purple-500' : 'bg-[#141414]/15')}>
                  <div className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform', test.enabled ? 'translate-x-4' : 'translate-x-0')} />
                </div>
              </label>
              <button onClick={() => removeTest(idx)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Test body */}
          <div className="p-4 grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Блок</label>
              <select
                value={test.blockId}
                onChange={(e) => updateTest(idx, { blockId: e.target.value as BlockId })}
                className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]"
              >
                {BLOCK_CONFIG.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Частка варіанту A (%)</label>
              <input type="range" min={0} max={100} value={test.splitRatio}
                onChange={(e) => updateTest(idx, { splitRatio: Number(e.target.value) })}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-[#141414]/40 mt-1">
                <span>A: {test.splitRatio}%</span>
                <span>B: {100 - test.splitRatio}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Назва варіанту A</label>
                <input
                  className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]"
                  value={test.variantA.label}
                  onChange={(e) => updateTest(idx, { variantA: { ...test.variantA, label: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#141414]/50 block mb-1">Назва варіанту B</label>
                <input
                  className="w-full border border-[#141414]/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]"
                  value={test.variantB.label}
                  onChange={(e) => updateTest(idx, { variantB: { ...test.variantB, label: e.target.value } })}
                />
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 text-xs text-[#141414]/40">
            💡 Варіант B показує блок із вимкненою видимістю (тестує ефект відсутності блоку на конверсію). Кожен відвідувач бачить один і той самий варіант протягом сесії.
          </div>
        </div>
      ))}
      <button
        onClick={addTest}
        className="flex items-center gap-2 text-sm text-[#141414]/60 hover:text-[#141414] border border-dashed border-[#141414]/20 rounded-xl px-4 py-3 w-full justify-center hover:border-[#141414]/40 transition"
      >
        <Plus size={14} /> Додати A/B тест
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = 'blocks' | 'abtests';

export default function AdminBlocks() {
  const navigate = useNavigate();
  const [docData, setDocData] = useState<BlocksDocument>(DEFAULT_DOCUMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<Set<BlockId>>(new Set());
  const [tab, setTab] = useState<Tab>('blocks');

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'blocks'));
        if (!mounted) return;
        if (snap.exists()) {
          const raw = snap.data() as Partial<BlocksDocument>;
          setDocData({
            order:    Array.isArray(raw.order) && raw.order.length ? raw.order as BlockId[] : DEFAULT_DOCUMENT.order,
            enabled:  { ...DEFAULT_DOCUMENT.enabled,  ...(raw.enabled  ?? {}) },
            settings: { ...DEFAULT_DOCUMENT.settings, ...(raw.settings ?? {}) },
            abTests:  Array.isArray(raw.abTests) ? raw.abTests : [],
          });
        }
      } catch (err) {
        console.warn('[AdminBlocks]', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Patch helpers ─────────────────────────────────────────────────────────
  const patch = useCallback(<K extends keyof BlocksDocument>(key: K, value: BlocksDocument[K]) => {
    setDocData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  // ── DnD ───────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = docData.order.indexOf(active.id as BlockId);
    const newIndex = docData.order.indexOf(over.id   as BlockId);
    patch('order', arrayMove(docData.order, oldIndex, newIndex));
  };

  // ── Toggle enabled ────────────────────────────────────────────────────────
  const toggleEnabled = (id: BlockId) => {
    patch('enabled', { ...docData.enabled, [id]: !docData.enabled[id] });
  };

  // ── Per-block settings ────────────────────────────────────────────────────
  const updateBlockSettings = (id: BlockId, val: Record<string, unknown>) => {
    patch('settings', { ...docData.settings, [id]: val });
  };

  // ── Toggle expand ─────────────────────────────────────────────────────────
  const toggleExpand = (id: BlockId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Enable all ────────────────────────────────────────────────────────────
  const enableAll = () => {
    const all = Object.fromEntries(docData.order.map((id) => [id, true])) as Record<BlockId, boolean>;
    patch('enabled', all);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = async () => {
    setLoading(true);
    setDirty(false);
    try {
      const snap = await getDoc(doc(db, 'settings', 'blocks'));
      if (snap.exists()) {
        const raw = snap.data() as Partial<BlocksDocument>;
        setDocData({
          order:    Array.isArray(raw.order) && raw.order.length ? raw.order as BlockId[] : DEFAULT_DOCUMENT.order,
          enabled:  { ...DEFAULT_DOCUMENT.enabled,  ...(raw.enabled  ?? {}) },
          settings: { ...DEFAULT_DOCUMENT.settings, ...(raw.settings ?? {}) },
          abTests:  Array.isArray(raw.abTests) ? raw.abTests : [],
        });
      } else {
        setDocData(DEFAULT_DOCUMENT);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'blocks'),
        { ...docData, updatedAt: serverTimestamp() },
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

  // ── Navigate ──────────────────────────────────────────────────────────────
  const openOnSite  = (id: BlockId) => window.open(ANCHORS[id] ? `/uk#${ANCHORS[id]}` : '/uk', '_blank');
  const editContent = (_id: BlockId) => navigate('/admin/block-content');

  // ─────────────────────────────────────────────────────────────────────────
  const visibleCount = docData.order.filter((id) => docData.enabled[id]).length;
  const activeAB     = docData.abTests.filter((t) => t.enabled).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#141414]/40" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Layers size={26} className="text-[#141414]" />
              <h1 className="text-3xl font-serif text-[#141414]">Блоки сайту</h1>
            </div>
            <p className="text-sm text-[#141414]/55 max-w-lg">
              Перетягуйте рядки щоб змінити порядок. Вмикайте/вимикайте секції.
              Налаштовуйте вміст блоків і запускайте A/B тести.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={reset} disabled={!dirty || saving}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#141414]/15 rounded-lg text-sm text-[#141414]/65 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">
              <RotateCcw size={13} /> Скасувати
            </button>
            <button onClick={handleSave} disabled={!dirty || saving}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition',
                dirty ? 'bg-[#141414] text-white hover:bg-[#141414]/85' : 'bg-[#141414]/10 text-[#141414]/35 cursor-not-allowed')}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Видимих блоків', val: `${visibleCount} / ${docData.order.length}` },
            { label: 'A/B тести активних', val: String(activeAB) },
            { label: 'Статус', val: dirty ? '● Не збережено' : savedAt ? `Збережено ${savedAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}` : '✓ Актуально' },
            { label: 'Швидко', val: null },
          ].map(({ label, val }, i) => (
            <div key={i} className="bg-white border border-[#141414]/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 mb-1">{label}</p>
              {val ? (
                <p className={cn('text-sm font-medium', dirty && i === 2 ? 'text-amber-600' : !dirty && i === 2 ? 'text-emerald-600' : 'text-[#141414]')}>{val}</p>
              ) : (
                <button onClick={enableAll} className="text-sm text-[#141414] hover:underline">Увімкнути всі →</button>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {([['blocks', 'Блоки'], ['abtests', `A/B Тести${activeAB ? ` (${activeAB})` : ''}`]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-5 py-2.5 rounded-lg text-sm font-medium transition', tab === t ? 'bg-[#141414] text-white' : 'bg-white border border-[#141414]/10 text-[#141414]/65 hover:bg-[#141414]/5')}>
              {label}
            </button>
          ))}
          <button onClick={() => navigate('/admin/block-content')}
            className="ml-auto px-5 py-2.5 rounded-lg text-sm font-medium border border-[#141414]/10 bg-white text-[#141414]/65 hover:bg-[#141414]/5 transition flex items-center gap-2">
            <FileEdit size={13} /> Редагувати тексти
          </button>
        </div>

        {/* Tab: Blocks */}
        {tab === 'blocks' && (
          <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#141414]/8 bg-[#fafafa]">
              <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-medium">
                Перетягуйте рядки ↕ щоб змінити порядок на сайті
              </p>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={docData.order} strategy={verticalListSortingStrategy}>
                {docData.order.map((id, idx) => {
                  const hasAB = docData.abTests.some((t) => t.enabled && t.blockId === id);
                  const blockSettings = (docData.settings[id] ?? DEFAULT_BLOCK_SETTINGS[id] ?? {}) as Record<string, unknown>;

                  return (
                    <SortableRow
                      key={id} id={id} idx={idx}
                      enabled={docData.enabled[id] ?? true}
                      expanded={expanded.has(id)}
                      abActive={hasAB}
                      onToggleEnabled={toggleEnabled}
                      onToggleExpand={toggleExpand}
                      onOpenSite={openOnSite}
                      onEditContent={editContent}
                    >
                      {id === 'Cases' && (
                        <CasesSettingsPanel
                          value={blockSettings as unknown as CasesBlockSettings}
                          onChange={(v) => updateBlockSettings(id, v as Record<string, unknown>)}
                        />
                      )}
                      {id === 'Reviews' && (
                        <ReviewsSettingsPanel
                          value={blockSettings as unknown as ReviewsBlockSettings}
                          onChange={(v) => updateBlockSettings(id, v as Record<string, unknown>)}
                        />
                      )}
                      {id === 'FAQ' && (
                        <FAQSettingsPanel
                          value={blockSettings as unknown as FAQBlockSettings}
                          onChange={(v) => updateBlockSettings(id, v as Record<string, unknown>)}
                        />
                      )}
                      {id === 'Services' && (
                        <ServicesSettingsPanel
                          value={blockSettings as unknown as ServicesBlockSettings}
                          onChange={(v) => updateBlockSettings(id, v as Record<string, unknown>)}
                        />
                      )}
                    </SortableRow>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Tab: A/B Tests */}
        {tab === 'abtests' && (
          <div className="bg-white border border-[#141414]/10 rounded-2xl p-6">
            <ABTestsPanel abTests={docData.abTests} onChange={(t) => patch('abTests', t)} />
          </div>
        )}

        <p className="text-xs text-[#141414]/35 mt-4 text-center">
          💡 Вимкнення Hero або Contacts суттєво вплине на конверсію. Зміни активуються одразу після збереження.
        </p>
      </div>
    </div>
  );
}
