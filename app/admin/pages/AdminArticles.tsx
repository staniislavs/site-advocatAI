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
  getPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  Post,
  BLOG_CATEGORIES,
  BLOG_CATEGORY_IDS,
  getCategoryLabel
} from '../../lib/blogService';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  Loader2,
  Save,
  X,
  FileText,
  Calendar,
  Tag,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, transliterate } from '../../lib/utils';

export const AdminArticles: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    
    const timer = setTimeout(() => {
      setLoading(p => {
        if (p) console.warn('Articles loading timed out');
        return false;
      });
    }, 8000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timer);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setArticles(data);
      setLoading(false);
    }, (error) => {
      clearTimeout(timer);
      if (error.message.includes('offline')) {
        console.warn('Articles: Client is offline.');
        setLoading(false);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'articles');
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
      // Auto-generate slug if missing
      const slug = currentArticle.slug || transliterate(currentArticle.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const payload = {
        ...currentArticle,
        slug,
        updatedAt: serverTimestamp()
      };
      
      if (!currentArticle.id) {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'articles'), payload);
      } else {
        const { id, ...data } = payload;
        await updateDoc(doc(db, 'articles', id), data);
      }
      setIsEditing(false);
      setCurrentArticle(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'articles');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif italic text-[#141414]">
            {currentArticle?.id ? 'Редагувати статтю' : 'Написати нову статтю'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-[#141414]/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#141414]/10 p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Заголовок статті</label>
                  <input 
                    required
                    type="text" 
                    value={currentArticle?.title || ''}
                    onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})}
                    className="w-full h-14 text-xl font-serif bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] transition-all"
                    placeholder="Введіть заголовок..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Контент (Markdown/HTML)</label>
                  <textarea 
                    rows={15}
                    value={currentArticle?.content || ''}
                    onChange={e => setCurrentArticle({...currentArticle, content: e.target.value})}
                    className="w-full bg-[#141414]/5 px-4 py-3 outline-none focus:ring-1 ring-[#141414] font-mono text-sm leading-relaxed"
                    placeholder="Почніть писати тут..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Slug (URL шлях)</label>
                  <input 
                    type="text" 
                    value={currentArticle?.slug || ''}
                    onChange={e => setCurrentArticle({...currentArticle, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full h-11 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] text-xs font-mono"
                    placeholder="yak-pravylno-rozluchytysya"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Зображення статті (URL)</label>
                  <input 
                    type="text" 
                    value={currentArticle?.coverImage || ''}
                    onChange={e => setCurrentArticle({...currentArticle, coverImage: e.target.value})}
                    className="w-full h-11 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] text-xs font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="mt-2 text-[9px] text-[#141414]/40 italic">Залиште порожнім, якщо хочете використовувати стандартну іконку категорії</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-[#141414]/10 p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Статус</label>
                  <select 
                    value={currentArticle?.status || 'draft'}
                    onChange={e => setCurrentArticle({...currentArticle, status: e.target.value})}
                    className="w-full h-11 bg-[#141414]/5 px-4 outline-none font-bold text-[10px] uppercase tracking-widest"
                  >
                    <option value="draft">Чернетка</option>
                    <option value="published">Опубліковано</option>
                    <option value="archived">Архів</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Категорія</label>
                  <select 
                    value={BLOG_CATEGORY_IDS.includes(currentArticle?.category) ? currentArticle.category : 'rozluchennya'}
                    onChange={e => setCurrentArticle({...currentArticle, category: e.target.value})}
                    className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm font-bold truncate"
                  >
                     {BLOG_CATEGORY_IDS.map(cat => (
                       <option key={cat} value={cat}>
                         {t(`blog.categories.items.${cat}`)}
                       </option>
                     ))}
                   </select>
                 </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Короткий уривок (Excerpt)</label>
                  <textarea 
                    rows={3}
                    value={currentArticle?.excerpt || ''}
                    onChange={e => setCurrentArticle({...currentArticle, excerpt: e.target.value})}
                    className="w-full bg-[#141414]/5 px-4 py-2 outline-none text-sm"
                    placeholder="Короткий опис для списку статей..."
                  />
                </div>
                <div className="pt-4 border-t border-[#141414]/10">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Зберегти та оприлюднити
                  </button>
                </div>
              </div>
            </div>
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
            placeholder="Пошук статей за назвою..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-11 bg-[#141414]/5 border-none outline-none focus:ring-1 ring-[#141414]"
          />
        </div>
        <button 
          onClick={() => {
            setCurrentArticle({ status: 'draft', content: '', category: 'rozluchennya' });
            setIsEditing(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all"
        >
          <Plus size={14} /> Створити статтю
        </button>
      </div>

      <div className="bg-white border border-[#141414]/10">
        <div className="grid grid-cols-1 divide-y divide-[#141414]/10">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#141414]/20" size={32} />
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#141414]/40">Завантаження...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <FileText className="text-[#141414]/10" size={48} />
              <p className="text-[#141414]/40 font-serif italic">Статей поки немає</p>
            </div>
          ) : (
            articles
              .filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((article) => (
              <div key={article.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#141414]/[0.02] transition-colors group">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-[#141414]/5 flex flex-col items-center justify-center shrink-0 group-hover:bg-[#141414] group-hover:text-white transition-all">
                    <span className="text-[10px] font-bold uppercase">{article.status === 'published' ? 'PUB' : 'DFT'}</span>
                  </div>
                  <div>
                    <h3 className="font-serif italic text-lg leading-tight mb-1">{article.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-widest text-[#141414]/40 uppercase">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {article.createdAt ? format(article.createdAt, 'dd.MM.yyyy') : 'Не заплановано'}</span>
                      <span className="flex items-center gap-1.5"><Tag size={12} /> {getCategoryLabel(article.category, t)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setCurrentArticle(article);
                      setIsEditing(true);
                    }}
                    className="p-3 bg-[#141414]/5 hover:bg-[#141414] hover:text-white transition-all text-[#141414]/60"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={async () => {
                      if(window.confirm('Видалити статтю?')) {
                        await deleteDoc(doc(db, 'articles', article.id));
                      }
                    }}
                    className="p-3 bg-red-50 hover:bg-red-600 hover:text-white transition-all text-red-300"
                  >
                    <Trash2 size={16} />
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

export default AdminArticles;
