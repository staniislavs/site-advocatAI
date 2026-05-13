import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ExternalLink,
  ChevronDown,
  Download,
  UserPlus,
  MessageSquare,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    
    // Safety timeout for the spinner
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('Leads loading timed out, showing initial state.');
        return false;
      });
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate()
      }));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      if (error.message.includes('offline')) {
        console.warn('Leads: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { 
        status: newStatus,
        updatedAt: serverTimestamp() 
      });
    } catch (error: any) {
      if (error.message && error.message.includes('offline')) {
        console.warn('Leads: Cannot update status while offline.');
      } else {
        handleFirestoreError(error, OperationType.UPDATE, `leads/${leadId}`);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const currentComments = selectedLead.internalComments || [];
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        internalComments: [...currentComments, {
          text: comment,
          createdAt: new Date().toISOString(),
          author: 'Admin'
        }]
      });
      setComment('');
      // Update local state for selected lead
      setSelectedLead({
        ...selectedLead,
        internalComments: [...currentComments, { text: comment, createdAt: new Date().toISOString(), author: 'Admin' }]
      });
    } catch (error: any) {
      if (error.message && error.message.includes('offline')) {
        console.warn('Leads: Cannot add comment while offline.');
      } else {
        handleFirestoreError(error, OperationType.UPDATE, `leads/${selectedLead.id}`);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Дата', 'Клієнт', 'Телефон', 'Email', 'Послуга', 'Статус', 'Повідомлення'];
    const rows = leads.map(l => [
      l.createdAt ? format(l.createdAt, 'dd.MM.yyyy HH:mm') : '',
      l.clientName,
      l.phone,
      l.email || '',
      l.serviceType || '',
      l.status,
      (l.message || '').replace(/\n/g, ' ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${format(new Date(), 'dd_MM_yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (leadId: string) => {
    try {
      setIsDeleting(true);
      if (selectedLead?.status === 'archived') {
        await deleteDoc(doc(db, 'leads', leadId));
      } else {
        await updateDoc(doc(db, 'leads', leadId), { 
          status: 'archived',
          updatedAt: serverTimestamp()
        });
      }
      setSelectedLead(null);
      setShowConfirmDelete(false);
    } catch (error: any) {
      if (error.message && error.message.includes('offline')) {
        console.warn('Leads: Cannot delete while offline.');
      } else {
        handleFirestoreError(error, OperationType.DELETE, `leads/${leadId}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (lead.phone || '').includes(searchTerm) ||
                         (lead.message?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new': return { label: 'Нова', color: 'bg-blue-100 text-blue-700', icon: Clock };
      case 'in_progress': return { label: 'В роботі', color: 'bg-amber-100 text-amber-700', icon: Loader2 };
      case 'completed': return { label: 'Виконано', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      case 'rejected': return { label: 'Відхилено', color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'archived': return { label: 'Архів', color: 'bg-gray-100 text-gray-400', icon: Trash2 };
      default: return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Заявки</h1>
          <p className="text-[#141414]/50 font-medium">Керування вхідними зверненнями клієнтів</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[#141414] text-[#141414] font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all"
          >
            <Download size={14} /> Експорт CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 space-y-4 transition-all duration-500",
          selectedLead ? "opacity-40 pointer-events-none grayscale sm:opacity-100 sm:pointer-events-auto sm:grayscale-0" : ""
        )}>
          {/* Filters Bar */}
          <div className="bg-white border border-[#141414]/10 p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
              <input 
                type="text" 
                placeholder="Пошук за ім'ям, телефоном..."
                className="w-full pl-10 pr-4 h-11 bg-[#141414]/5 border-none outline-none focus:ring-1 ring-[#141414] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={18} className="text-[#141414]/40 shrink-0" />
              <select 
                className="h-11 px-4 bg-[#141414]/5 border-none outline-none focus:ring-1 ring-[#141414] font-medium text-sm flex-1 md:w-40"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Всі статуси</option>
                <option value="new">Нові</option>
                <option value="in_progress">В роботі</option>
                <option value="completed">Виконані</option>
                <option value="rejected">Відхилені</option>
                <option value="archived">Архів</option>
              </select>
            </div>
          </div>

          {/* Leads List */}
          <div className="bg-white border border-[#141414]/10 divide-y divide-[#141414]/10">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#141414]/20" size={40} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-20 text-center text-[#141414]/40 font-serif italic">Заявок не знайдено</div>
            ) : (
              filteredLeads.map((lead) => {
                const status = getStatusConfig(lead.status);
                return (
                  <div 
                    key={lead.id} 
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowConfirmDelete(false);
                    }}
                    className={cn(
                      "p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#141414]/[0.02] transition-colors relative group",
                      selectedLead?.id === lead.id ? "bg-[#141414]/[0.03] ring-1 ring-inset ring-[#141414]/10" : ""
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-[#141414] uppercase tracking-wide">{lead.clientName}</h3>
                        <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm", status.color)}>
                          {status.label}
                        </span>
                        {lead.internalComments?.length > 0 && (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-[#141414]/30 uppercase tracking-widest">
                            <MessageSquare size={10} /> {lead.internalComments.length}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</span>
                         <span className="flex items-center gap-1.5"><Clock size={12} /> {lead.createdAt ? format(lead.createdAt, 'dd.MM.yyyy HH:mm') : '-'}</span>
                         <span className="bg-[#141414]/5 px-1.5">{lead.serviceType || 'Загальний запит'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 hover:bg-[#141414]/10 text-[#141414]/20 hover:text-[#141414] transition-all">
                          <ExternalLink size={18} />
                       </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lead Details Panel */}
        <div className={cn(
          "bg-white border border-[#141414]/10 h-fit sticky top-8 transition-all duration-500 transform",
          selectedLead ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 pointer-events-none"
        )}>
          {selectedLead && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-[#141414]/10 bg-[#141414]/[0.02] flex items-center justify-between">
                <h2 className="font-serif italic text-xl">Деталі заявки</h2>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-[#141414]/5">
                  <XCircle size={20} className="text-[#141414]/40" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">Статус обробки</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['new', 'in_progress', 'completed', 'rejected'].map(s => {
                        const active = selectedLead.status === s;
                        const config = getStatusConfig(s);
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(selectedLead.id, s)}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all border",
                              active ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-[#141414]/40 border-[#141414]/10 hover:border-[#141414]/30"
                            )}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 py-4 border-y border-[#141414]/10 grid grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-1">Пошта</p>
                      <a href={`mailto:${selectedLead.email}`} className="text-sm font-medium hover:underline">{selectedLead.email || 'Не вказано'}</a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 mb-1">Джерело</p>
                      <span className="text-sm font-medium">Форма замовлення</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30">Опис ситуації</label>
                    <p className="text-sm mt-2 leading-relaxed bg-[#141414]/5 p-4 italic font-serif">
                      "{selectedLead.message || 'Повідомлення відсутнє'}"
                    </p>
                  </div>
                </div>

                {/* Internal Comments */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/30 flex items-center gap-2">
                    <MessageSquare size={12} /> Внутрішні нотатки
                  </label>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {selectedLead.internalComments?.map((c: any, i: number) => (
                      <div key={i} className="text-xs bg-amber-50/50 p-3 border-l-2 border-amber-200">
                        <p className="text-[#141414]/80 mb-1">{c.text}</p>
                        <p className="text-[9px] text-amber-600/60 font-bold uppercase tracking-widest">
                          {c.author} • {format(new Date(c.createdAt), 'dd.MM HH:mm')}
                        </p>
                      </div>
                    ))}
                    {(!selectedLead.internalComments || selectedLead.internalComments.length === 0) && (
                      <p className="text-center py-4 text-[10px] text-[#141414]/20 italic">Нотатки відсутні</p>
                    )}
                  </div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" 
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Додати коментар..."
                      className="flex-1 h-10 px-3 bg-[#141414]/5 border-none outline-none text-xs"
                    />
                    <button type="submit" className="w-10 h-10 bg-[#141414] text-white flex items-center justify-center hover:bg-[#141414]/90 transition-all">
                      <Plus size={16} />
                    </button>
                  </form>
                </div>

                <div className="pt-6 border-t border-[#141414]/10">
                   {!showConfirmDelete ? (
                     <button 
                      onClick={() => setShowConfirmDelete(true)}
                      className="w-full h-11 border border-red-200 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                     >
                       <Trash2 size={14} /> 
                       {selectedLead.status === 'archived' ? 'Видалити назавжди' : 'Видалити заявку'}
                     </button>
                   ) : (
                     <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center text-red-500">
                          {selectedLead.status === 'archived' 
                            ? 'Цю дію неможливо скасувати!' 
                            : 'Заявку буде переміщено в архів'}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            disabled={isDeleting}
                            onClick={() => setShowConfirmDelete(false)}
                            className="flex-1 h-11 border border-[#141414]/10 text-[#141414]/40 font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/5 transition-all"
                          >
                            Скасувати
                          </button>
                          <button 
                            disabled={isDeleting}
                            onClick={() => handleDelete(selectedLead.id)}
                            className="flex-1 h-11 bg-red-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Підтвердити'}
                          </button>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
