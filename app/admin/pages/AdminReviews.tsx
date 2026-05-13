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
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  MessageSquare,
  Star,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('Reviews loading timed out');
        return false;
      });
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      if (error.message.includes('offline')) {
        console.warn('Reviews: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
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
      const payload = {
        ...currentReview,
        updatedAt: serverTimestamp(),
        // Ensure name is used (as in Reviews.tsx) or author (as in current AdminReviews.tsx)
        // I will set both to be safe or pick one. Standardizing to 'name' as it's common in schemas.
        name: currentReview.name || currentReview.author || '',
        author: currentReview.name || currentReview.author || '',
        isApproved: currentReview.isApproved ?? true,
        rating: Number(currentReview.rating || 5)
      };

      if (!currentReview.id) {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'reviews'), payload);
      } else {
        const { id, ...data } = payload;
        await updateDoc(doc(db, 'reviews', id), data);
      }
      setIsEditing(false);
      setCurrentReview(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { isApproved: !current });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити вiдгук?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${id}`);
    }
  };

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif italic text-[#141414]">
            {currentReview?.id ? 'Редагувати відгук' : 'Додати новий відгук'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-[#141414]/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div className="bg-white border border-[#141414]/10 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Ім'я автора</label>
                <input 
                  required
                  type="text" 
                  value={currentReview?.name || currentReview?.author || ''}
                  onChange={e => setCurrentReview({...currentReview, name: e.target.value, author: e.target.value})}
                  className="w-full h-11 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] transition-all text-sm font-bold"
                  placeholder="Введіть ім'я..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Дата</label>
                <input 
                  required
                  type="text" 
                  value={currentReview?.date || ''}
                  onChange={e => setCurrentReview({...currentReview, date: e.target.value})}
                  className="w-full h-11 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] transition-all text-sm"
                  placeholder="Наприклад: Березень 2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Рейтинг (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCurrentReview({...currentReview, rating: star})}
                    className={cn(
                      "p-2 transition-all",
                      (currentReview?.rating || 5) >= star ? "text-gold" : "text-[#141414]/10"
                    )}
                  >
                    <Star size={24} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Текст відгуку</label>
              <textarea 
                required
                rows={5}
                value={currentReview?.text || ''}
                onChange={e => setCurrentReview({...currentReview, text: e.target.value})}
                className="w-full bg-[#141414]/5 px-4 py-3 outline-none focus:ring-1 ring-[#141414] transition-all text-sm leading-relaxed italic font-serif"
                placeholder="Введіть текст відгуку..."
              />
            </div>

            <div className="pt-4 border-t border-[#141414]/10">
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Зберегти відгук
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => {
            setCurrentReview({ rating: 5, isApproved: true });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-xl shadow-black/10"
        >
          <Plus size={14} /> Додати відгук
        </button>
      </div>

      <div className="bg-white border border-[#141414]/10">
        <div className="p-4 border-b border-[#141414]/10 flex items-center justify-between bg-[#141414]/[0.01]">
          <h3 className="font-serif italic text-lg">Модерація відгуків</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
            {reviews.length} всього
          </span>
        </div>

        <div className="divide-y divide-[#141414]/10">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#141414]/20" /></div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-[#141414]/40 italic font-serif">Вiдгукiв поки немає</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-[#141414]/[0.01] transition-all flex flex-col md:flex-row gap-6 group">
                 <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center font-serif text-sm">
                          {(review.name || review.author)?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wide">{review.name || review.author || 'Анонiм'}</p>
                          <p className="text-[10px] text-[#141414]/40">{review.date || 'Дата не вказана'}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < (review.rating || 5) ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic text-[#141414]/80 leading-relaxed border-l border-[#141414]/10 pl-4">
                      "{review.text}"
                    </p>
                 </div>
                 
                 <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 w-full">
                      <button 
                        onClick={() => toggleApproval(review.id, review.isApproved)}
                        className={cn(
                          "flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all justify-center border",
                          review.isApproved 
                            ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                        )}
                      >
                        {review.isApproved ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {review.isApproved ? 'Схвалено' : 'Очiкує'}
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentReview(review);
                          setIsEditing(true);
                        }}
                        className="p-2 bg-[#141414]/5 hover:bg-[#141414] hover:text-white transition-all text-[#141414]/60 border border-[#141414]/10"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-400 border border-red-100 hover:bg-red-600 hover:text-white transition-all w-full justify-center flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Видалити
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
