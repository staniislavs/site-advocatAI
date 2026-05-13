import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Mail, 
  Send as TelegramIcon, 
  MessageCircle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Settings2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Connection {
  id: string;
  type: 'email' | 'telegram' | 'whatsapp';
  value: string;
  label: string;
  isActive: boolean;
  createdAt: any;
}

export const AdminConnections: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: 'email' | 'telegram' | 'whatsapp';
    value: string;
    label: string;
    isActive: boolean;
  }>({
    type: 'email',
    value: '',
    label: '',
    isActive: true
  });

  useEffect(() => {
    const q = query(collection(db, 'notification_connections'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Connection[];
      setConnections(data);
      setLoading(false);
    }, (error) => {
      if (error.message.includes('offline')) {
        console.warn('Connections: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'notification_connections');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'notification_connections'), {
        ...formData,
        createdAt: Timestamp.now()
      });
      setIsModalOpen(false);
      setFormData({
        type: 'email',
        value: '',
        label: '',
        isActive: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'notification_connections');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConnection = async (connection: Connection) => {
    try {
      await updateDoc(doc(db, 'notification_connections', connection.id), {
        isActive: !connection.isActive
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notification_connections');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити канал сповіщення?')) return;
    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'notification_connections', id));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notification_connections');
      setDeletingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'telegram': return <TelegramIcon className="w-5 h-5" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      default: return <Settings2 className="w-5 h-5" />;
    }
  };

  const groupedConnections = {
    email: connections.filter(c => c.type === 'email'),
    telegram: connections.filter(c => c.type === 'telegram'),
    whatsapp: connections.filter(c => c.type === 'whatsapp')
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Пiдключення</h1>
          <p className="text-[#141414]/50 font-medium">Налаштування каналів сповiщень для пуш-повiдомлень</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-lg shadow-black/5"
        >
          <Plus size={14} /> Додати канал
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['email', 'telegram', 'whatsapp'] as const).map((type) => (
          <div key={type} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  type === 'email' ? "bg-blue-50 text-blue-600" :
                  type === 'telegram' ? "bg-sky-50 text-sky-600" :
                  "bg-green-50 text-green-600"
                )}>
                  {getIcon(type)}
                </div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-[#141414]/40">
                  {type === 'email' ? 'E-mail' : type === 'telegram' ? 'Telegram' : 'WhatsApp'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#141414]/5 px-2 py-0.5 rounded-full">
                {groupedConnections[type].length}
              </span>
            </div>

            <div className="space-y-3">
              {groupedConnections[type].length === 0 ? (
                <div className="bg-[#141414]/[0.02] border border-dashed border-[#141414]/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-10 h-10 rounded-full bg-[#141414]/5 flex items-center justify-center mb-3">
                     <AlertCircle size={18} className="text-[#141414]/20" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">Немає пiдключень</p>
                </div>
              ) : (
                groupedConnections[type].map((conn) => (
                  <div 
                    key={conn.id}
                    className="group bg-white border border-[#141414]/5 p-5 rounded-2xl hover:border-[#141414]/20 transition-all hover:shadow-xl hover:shadow-black/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm truncate">{conn.label || conn.value}</span>
                        {!conn.isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-tighter">Вiдключено</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#141414]/40 truncate">{conn.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       {deletingId === conn.id ? (
                         <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-all"
                            >
                              Скасувати
                            </button>
                            <button
                              onClick={() => handleDelete(conn.id)}
                              className="px-3 py-1 bg-red-500 text-white text-[8px] font-bold uppercase tracking-widest rounded hover:bg-red-600 transition-all"
                            >
                              Видалити
                            </button>
                         </div>
                       ) : (
                         <>
                           <button
                             onClick={() => toggleConnection(conn)}
                             className={cn(
                               "p-2 rounded-full transition-all",
                               conn.isActive ? "text-green-500 hover:bg-green-50" : "text-[#141414]/20 hover:bg-[#141414]/5"
                             )}
                           >
                             {conn.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                           </button>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               setDeletingId(conn.id);
                             }}
                             className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                           >
                             <Trash2 size={16} />
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-white p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#141414]/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif italic text-2xl mb-1">Додати канал сповiщення</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-8">
              Вкажiть реквiзити для нового пiдключення
            </p>

            <form onSubmit={handleAddConnection} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Назва (Напр: "Основна пошта")
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full h-12 px-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium"
                  placeholder="Введiть назву..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  Тип сервiсу
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['email', 'telegram', 'whatsapp'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={cn(
                        "h-12 border flex flex-col items-center justify-center gap-1 transition-all",
                        formData.type === type 
                          ? "bg-[#141414] text-white border-[#141414]" 
                          : "border-[#141414]/10 hover:border-[#141414]/30 text-[#141414]/40"
                      )}
                    >
                      {getIcon(type)}
                      <span className="text-[8px] font-bold uppercase tracking-widest">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#141414]/40 block pl-1">
                  {formData.type === 'email' ? 'Email адреса' : 
                   formData.type === 'telegram' ? 'Telegram Chat ID (числовий)' : 
                   'Номер телефону (WhatsApp)'}
                </label>
                <input 
                  required
                  type={formData.type === 'email' ? 'email' : 'text'} 
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  className="w-full h-12 px-4 bg-[#141414]/[0.02] border border-[#141414]/10 focus:border-[#141414] outline-none transition-all text-sm font-medium"
                  placeholder={formData.type === 'email' ? 'example@mail.com' : 
                               formData.type === 'telegram' ? 'Напр: 123456789' : 
                               '+380...'}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#141414]/[0.02] rounded-xl border border-[#141414]/5">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest">Активний канал</p>
                   <p className="text-[9px] text-[#141414]/40">Чи надсилати сповiщення на цей канал</p>
                 </div>
                 <button
                   type="button"
                   onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                   className={cn(
                     "p-1 rounded-full transition-all",
                     formData.isActive ? "text-green-500" : "text-[#141414]/20"
                   )}
                 >
                   {formData.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                 </button>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-[#141414] text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Пiдключити канал
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminConnections;
