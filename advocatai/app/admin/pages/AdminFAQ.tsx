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
  Edit2, 
  Trash2, 
  Loader2,
  Save,
  X,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'faq'), orderBy('order', 'asc'));
    
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('FAQ loading timed out');
        return false;
      });
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFaqs(data);
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      if (error.message.includes('offline')) {
        console.warn('FAQ: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'faq');
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
      if (currentFaq.id) {
        await updateDoc(doc(db, 'faq', currentFaq.id), {
          ...currentFaq,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'faq'), {
          ...currentFaq,
          order: faqs.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentFaq(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'faq');
    } finally {
      setLoading(false);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    try {
      await updateDoc(doc(db, 'faq', faqs[index].id), { order: targetIndex });
      await updateDoc(doc(db, 'faq', faqs[targetIndex].id), { order: index });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'faq');
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="bg-white border border-[#141414]/10 p-6 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic text-lg">{currentFaq?.id ? 'Редагувати питання' : 'Додати питання'}</h3>
          <button type="button" onClick={() => setIsEditing(false)}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Питання</label>
            <input 
              required
              type="text" 
              value={currentFaq?.question || ''}
              onChange={e => setCurrentFaq({...currentFaq, question: e.target.value})}
              className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Відповідь</label>
            <textarea 
              required
              rows={4}
              value={currentFaq?.answer || ''}
              onChange={e => setCurrentFaq({...currentFaq, answer: e.target.value})}
              className="w-full bg-[#141414]/5 px-4 py-3 outline-none text-sm leading-relaxed"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-[#141414]/10">
          <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#141414]/5 transition-all">Скасувати</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />} Зберегти
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setCurrentFaq({ question: '', answer: '' });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#141414]/90 transition-all"
        >
          <Plus size={14} /> Додати питання
        </button>
      </div>
      
      <div className="bg-white border border-[#141414]/10 divide-y divide-[#141414]/10">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#141414]/20" /></div>
        ) : faqs.length === 0 ? (
          <div className="py-20 text-center text-[#141414]/40 italic font-serif">Жодного питання не додано</div>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq.id} className="p-6 flex items-center gap-6 group hover:bg-[#141414]/[0.01]">
              <div className="flex flex-col gap-1 items-center shrink-0">
                <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="p-1 hover:bg-[#141414]/5 disabled:opacity-20"><ChevronUp size={16} /></button>
                <span className="text-[10px] font-mono font-bold text-[#141414]/20">{index + 1}</span>
                <button onClick={() => moveOrder(index, 'down')} disabled={index === faqs.length - 1} className="p-1 hover:bg-[#141414]/5 disabled:opacity-20"><ChevronDown size={16} /></button>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{faq.question}</h4>
                <p className="text-xs text-[#141414]/60 line-clamp-1">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                   onClick={() => {
                     setCurrentFaq(faq);
                     setIsEditing(true);
                   }}
                   className="p-2 hover:bg-[#141414]/5 text-[#141414]/40 hover:text-[#141414] transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={async () => {
                    if(window.confirm('Видалити?')) await deleteDoc(doc(db, 'faq', faq.id));
                  }}
                  className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 transition-all font-bold"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFAQ;
