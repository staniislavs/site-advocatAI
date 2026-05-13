import React, { useState } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Download, Database, Loader2, FileJson, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLLECTIONS = [
  'admins',
  'applications',
  'articles',
  'consultations',
  'leads',
  'media',
  'notification_connections',
  'reviews',
  'services',
  'settings',
  'faq',
  'content',
];

function serialize(value: any): any {
  if (value === null || value === undefined) return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = serialize(value[k]);
    return out;
  }
  return value;
}

export const AdminBackup: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ name: string; count: number }[]>([]);

  const handleExport = async () => {
    setExporting(true);
    setProgress([]);
    const result: Record<string, any[]> = {};
    try {
      for (const name of COLLECTIONS) {
        try {
          const snap = await getDocs(collection(db, name));
          const docs = snap.docs.map(d => ({ id: d.id, ...serialize(d.data()) }));
          result[name] = docs;
          setProgress(p => [...p, { name, count: docs.length }]);
        } catch (err) {
          console.warn(`Skipping ${name}:`, err);
          result[name] = [];
        }
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        projectId: 'gen-lang-client-0153725022',
        collections: result,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `firestore-backup-${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Експортовано ${Object.values(result).reduce((s, a) => s + a.length, 0)} документів`);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'backup');
      toast.error('Помилка експорту');
    } finally {
      setExporting(false);
    }
  };

  const totalDocs = progress.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif italic text-[#141414]">Резервна копія</h1>
        <p className="text-[#141414]/50 font-medium">Експорт усіх даних із Firestore у JSON-файл</p>
      </div>

      <div className="bg-white border border-[#141414]/10 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#141414] text-white flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#141414] mb-1">Повний експорт бази</h3>
              <p className="text-sm text-[#141414]/60">
                {COLLECTIONS.length} колекцій → один JSON файл
              </p>
              <p className="text-xs text-[#141414]/40 mt-2">
                Дані: заявки, статті, відгуки, налаштування, медіа, адміни, консультації
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 h-14 px-8 bg-[#141414] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/90 disabled:opacity-50 transition shrink-0"
          >
            {exporting ? (
              <><Loader2 className="animate-spin" size={16} /> Експорт...</>
            ) : (
              <><Download size={16} /> Завантажити</>
            )}
          </button>
        </div>
      </div>

      {progress.length > 0 && (
        <div className="bg-white border border-[#141414]/10">
          <div className="px-6 py-4 border-b border-[#141414]/10 flex items-center justify-between">
            <h3 className="font-serif italic text-lg flex items-center gap-2"><FileJson size={18} /> Прогрес</h3>
            <span className="text-xs text-[#141414]/50 font-mono">{totalDocs} документів</span>
          </div>
          <ul className="divide-y divide-[#141414]/5">
            {progress.map(p => (
              <li key={p.name} className="px-6 py-3 flex items-center justify-between text-sm">
                <span className="font-mono text-[#141414]/70">{p.name}</span>
                <span className={p.count === 0 ? 'text-[#141414]/30' : 'text-[#141414] font-bold'}>{p.count} docs</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 p-6 text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-bold text-amber-900">Рекомендації</p>
            <ul className="list-disc list-inside text-amber-900/80 space-y-1 text-xs">
              <li>Робіть бекап раз на тиждень або перед великими змінами.</li>
              <li>Зберігайте файли у безпечному місці (не в репозиторії).</li>
              <li>Файл містить чутливі дані — паролі SMTP, email клієнтів, телефони.</li>
              <li>Розмір файлу залежить від кількості медіа.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBackup;
