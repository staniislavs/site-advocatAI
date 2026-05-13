import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown,
  Loader2,
  Save,
  X,
  Layout
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('Services loading timed out');
        return false;
      });
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(data);
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      if (error.message.includes('offline')) {
        console.warn('Services: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'services');
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentService.id) {
        await updateDoc(doc(db, 'services', currentService.id), {
          ...currentService,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'services'), {
          ...currentService,
          order: services.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentService(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'services');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'services', id), { isActive: !current });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const itemA = services[index];
    const itemB = services[targetIndex];

    try {
      await updateDoc(doc(db, 'services', itemA.id), { order: targetIndex });
      await updateDoc(doc(db, 'services', itemB.id), { order: index });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'services');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ви впевнені?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  if (isEditing) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif italic text-[#141414]">
            {currentService?.id ? 'Редагувати послугу' : 'Додати нову послугу'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-[#141414]/5">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-[#141414]/10 p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Назва послуги</label>
                <input 
                  required
                  type="text" 
                  value={currentService?.name || ''}
                  onChange={e => setCurrentService({...currentService, name: e.target.value})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Ціна (або "За домовленістю")</label>
                <input 
                  type="text" 
                  value={currentService?.price || ''}
                  onChange={e => setCurrentService({...currentService, price: e.target.value})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] font-medium transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Короткий опис</label>
                <textarea 
                  rows={2}
                  value={currentService?.description || ''}
                  onChange={e => setCurrentService({...currentService, description: e.target.value})}
                  className="w-full bg-[#141414]/5 px-4 py-3 outline-none focus:ring-1 ring-[#141414] font-medium transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-12 h-6 bg-[#141414]/10 rounded-full transition-all group-hover:bg-[#141414]/20">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={currentService?.isActive ?? true}
                      onChange={e => setCurrentService({...currentService, isActive: e.target.checked})}
                    />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-[#141414]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Активна</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Детальний контент (HTML/Текст)</label>
            <textarea 
              rows={8}
              value={currentService?.content || ''}
              onChange={e => setCurrentService({...currentService, content: e.target.value})}
              className="w-full bg-[#141414]/5 px-4 py-3 outline-none focus:ring-1 ring-[#141414] font-medium transition-all font-mono text-sm"
              placeholder="Введіть основний текст сторінки послуги..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#141414]/10">
            <button 
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-8 py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/5 transition-all"
            >
              Скасувати
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Зберегти
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
          <input 
            type="text" 
            placeholder="Пошук послуг..."
            className="w-full pl-10 pr-4 h-11 bg-[#141414]/5 border-none outline-none focus:ring-1 ring-[#141414]"
          />
        </div>
        <button 
          onClick={() => {
            setCurrentService({ isActive: true, content: '', description: '', price: 'За домовленістю' });
            setIsEditing(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all"
        >
          <Plus size={14} /> Додати послугу
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 bg-white border border-[#141414]/10">
            <Loader2 className="animate-spin text-[#141414]/20" size={40} />
            <p className="text-[#141414]/40 font-serif italic">Завантаження...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#141414]/10 text-[#141414]/40 font-serif italic">
            Список послуг порожній
          </div>
        ) : (
          services.map((service, index) => (
            <div key={service.id} className="bg-white border border-[#141414]/10 p-4 transition-all hover:border-[#141414] flex items-center group">
              <div className="mr-6 flex flex-col gap-1 items-center">
                <button 
                  onClick={() => moveOrder(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-[#141414]/5 disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <div className="text-[10px] font-mono font-bold text-[#141414]/20">{index + 1}</div>
                <button 
                  onClick={() => moveOrder(index, 'down')}
                  disabled={index === services.length - 1}
                  className="p-1 hover:bg-[#141414]/5 disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-12 h-12 bg-[#141414]/5 flex items-center justify-center text-[#141414]/40 mr-6 group-hover:bg-[#141414] group-hover:text-white transition-all">
                <Layout size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#141414] uppercase tracking-wide text-sm">{service.name}</h3>
                  {!service.isActive && (
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] bg-red-100 text-red-600 px-2 py-0.5">Прихована</span>
                  )}
                </div>
                <p className="text-xs text-[#141414]/60 line-clamp-1">{service.description}</p>
              </div>

              <div className="mx-8 text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-1">Ціна</p>
                <p className="text-sm font-mono font-bold">{service.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(service.id, service.isActive)}
                  className="p-2 hover:bg-[#141414]/5 text-[#141414]/40 hover:text-[#141414] transition-all"
                  title={service.isActive ? "Сховати" : "Показати"}
                >
                  {service.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => {
                    setCurrentService(service);
                    setIsEditing(true);
                  }}
                  className="p-2 hover:bg-[#141414]/5 text-[#141414]/40 hover:text-[#141414] transition-all"
                  title="Редагувати"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"
                  title="Видалити"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminServices;
