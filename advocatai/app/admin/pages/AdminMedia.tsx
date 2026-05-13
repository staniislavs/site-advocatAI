import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Image as ImageIcon,
  Trash2,
  X,
  Loader2,
  Copy,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export const AdminMedia: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', url: '' });

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFiles(filesData);
      setLoading(false);
    }, (error) => {
      if (error.message.includes('offline')) {
        console.warn('Media: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'media');
      }
    });
    return () => unsubscribe();
  }, []);

  const guessType = (url: string) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','svg','avif'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    if (ext === 'pdf') return 'application/pdf';
    return 'image/jpeg';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { toast.error('Введіть URL'); return; }
    try { new URL(form.url); } catch { toast.error('Невалідний URL'); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'media'), {
        name: form.name.trim() || form.url.split('/').pop() || 'file',
        type: guessType(form.url),
        url: form.url.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success('Додано');
      setModalOpen(false);
      setForm({ name: '', url: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'media');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей файл?')) return;
    try {
      await deleteDoc(doc(db, 'media', fileId));
      toast.success('Файл видалено');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `media/${fileId}`);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Посилання скопійовано');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Медіа-бібліотека</h1>
          <p className="text-[#141414]/50 font-medium">Керування зображеннями та документами</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-xl"
          >
            <Plus size={14} /> Додати медіа
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#141414]/10">
              <h3 className="font-serif italic text-xl flex items-center gap-3"><LinkIcon size={20} /> Додати медіа</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-[#141414]/5"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">URL зображення / файлу</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm({...form, url: e.target.value})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-mono text-xs"
                  placeholder="https://images.unsplash.com/..."
                  required
                />
                <p className="text-[10px] text-[#141414]/40 mt-2">
                  Скопіюй посилання з Unsplash, Imgur, Google Drive (з public access) або іншого CDN
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Назва (опціонально)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none"
                  placeholder="Назва файлу"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-12 bg-[#141414]/5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/10">Скасувати</button>
                <button type="submit" disabled={submitting} className="flex-1 h-12 bg-[#141414] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#141414]/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Додати</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[#141414]/10 p-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
          <input 
            type="text" 
            placeholder="Пошук за назвою..."
            className="w-full pl-10 pr-4 h-11 bg-[#141414]/5 border-none outline-none focus:ring-1 ring-[#141414] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-[#141414]/5 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 transition-all",
              viewMode === 'grid' ? "bg-white text-[#141414] shadow-sm" : "text-[#141414]/40 hover:text-[#141414]"
            )}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 transition-all",
              viewMode === 'list' ? "bg-white text-[#141414] shadow-sm" : "text-[#141414]/40 hover:text-[#141414]"
            )}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#141414]/20" size={40} />
          <p className="text-[#141414]/40 font-serif italic">Завантаження файлів...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-[#141414]/20 bg-[#141414]/[0.01]">
          <ImageIcon className="mx-auto text-[#141414]/10 mb-4" size={48} />
          <p className="text-[#141414]/40 font-serif italic">Бібліотека порожня або нічого не знайдено</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="group relative bg-white border border-[#141414]/10 aspect-square overflow-hidden hover:shadow-2xl transition-all">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#141414]/5 text-[#141414]/40">
                  <FileText size={40} />
                  <span className="text-[8px] font-bold uppercase mt-2 tracking-widest">{file.type?.split('/')[1] || 'file'}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-[#141414]/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-4 line-clamp-2">{file.name}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(file.url, file.id)}
                    className="p-3 bg-white/10 text-white hover:bg-white hover:text-[#141414] transition-all"
                  >
                    {copiedId === file.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#141414]/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141414]/10 bg-[#141414]/[0.02]">
                <th className="px-6 py-4 font-serif italic text-sm">Файл</th>
                <th className="px-6 py-4 font-serif italic text-sm">Тип</th>
                <th className="px-6 py-4 font-serif italic text-sm">Розмір</th>
                <th className="px-6 py-4 font-serif italic text-sm">Дата</th>
                <th className="px-6 py-4 font-serif italic text-sm text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#141414]/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-[#141414]/10 overflow-hidden flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#141414]/5 text-[#141414]/30">
                            <File size={16} />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{file.type}</td>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{formatSize(file.size)}</td>
                  <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                    {file.createdAt ? format(file.createdAt.toDate(), 'dd.MM.yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => copyToClipboard(file.url, file.id)}
                        className="p-2 hover:bg-[#141414]/5 text-[#141414]/40 hover:text-[#141414] transition-all"
                       >
                         {copiedId === file.id ? <Check size={18} /> : <Copy size={18} />}
                       </button>
                       <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 transition-all font-bold"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
