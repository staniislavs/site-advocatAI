import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Save, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminHomeContent: React.FC = () => {
  const [data, setData] = useState<any>({
    hero: {
      title: 'Ваша сім\'я — це наш пріоритет',
      subtitle: 'Професійна юридична допомога у найскладніших сімейних справах',
      photoUrl: ''
    },
    advantages: [
      { id: 1, text: '10+ років досвіду', icon: 'Shield' },
      { id: 2, text: '98% виграних справ', icon: 'Award' },
      { id: 3, text: 'Повна конфіденційність', icon: 'Lock' },
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'content', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (err: any) {
        if (err.message && err.message.includes('offline')) {
          console.warn('Home content: Client is offline, using defaults.');
        } else {
          handleFirestoreError(err, OperationType.GET, 'content/home');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'content', 'home'), data);
      toast.success('Зміни збережено');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'content/home');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="font-serif italic text-2xl">Головна сторінка</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Зберегти
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="bg-white border border-[#141414]/10 p-8 space-y-6">
          <h3 className="font-serif italic text-xl border-b border-[#141414]/10 pb-4 mb-6">Перший блок (Hero)</h3>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Головний заголовок (H1)</label>
            <input 
              type="text" 
              value={data.hero.title}
              onChange={e => setData({...data, hero: {...data.hero, title: e.target.value}})}
              className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-serif italic text-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Підзаголовок</label>
            <textarea 
              rows={3}
              value={data.hero.subtitle}
              onChange={e => setData({...data, hero: {...data.hero, subtitle: e.target.value}})}
              className="w-full bg-[#141414]/5 px-4 py-3 outline-none text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">URL Фото (або ID з медіа)</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={data.hero.photoUrl}
                onChange={e => setData({...data, hero: {...data.hero, photoUrl: e.target.value}})}
                className="flex-1 h-12 bg-[#141414]/5 px-4 outline-none font-mono text-sm"
              />
              <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center">
                <ImageIcon size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Advantages Section */}
        <div className="bg-white border border-[#141414]/10 p-8 space-y-6">
          <h3 className="font-serif italic text-xl border-b border-[#141414]/10 pb-4 mb-6">Переваги (до 6 карток)</h3>
          
          <div className="space-y-4">
            {data.advantages.map((adv: any, index: number) => (
              <div key={adv.id} className="flex gap-4 p-4 bg-[#141414]/5">
                <div className="flex-1">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-[#141414]/40 mb-1">Текст переваги</label>
                  <input 
                    type="text" 
                    value={adv.text}
                    onChange={e => {
                      const newAdv = [...data.advantages];
                      newAdv[index].text = e.target.value;
                      setData({...data, advantages: newAdv});
                    }}
                    className="w-full h-8 bg-white px-3 outline-none text-xs font-bold"
                  />
                </div>
                <button 
                  onClick={() => {
                    const newAdv = data.advantages.filter((_: any, i: number) => i !== index);
                    setData({...data, advantages: newAdv});
                  }}
                  className="mt-auto h-8 px-2 text-red-400 hover:text-red-600 transition-colors"
                >
                  Видалити
                </button>
              </div>
            ))}
            
            {data.advantages.length < 6 && (
              <button 
                onClick={() => setData({
                  ...data, 
                  advantages: [...data.advantages, { id: Date.now(), text: 'Нова перевага', icon: 'CheckCloud' }]
                })}
                className="w-full h-12 border border-dashed border-[#141414]/20 text-[#141414]/40 hover:border-[#141414] hover:text-[#141414] transition-all font-bold uppercase tracking-widest text-[9px]"
              >
                + Додати перевагу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeContent;
