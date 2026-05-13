import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Save, Loader2, Search, Globe, Shield, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminSEO: React.FC = () => {
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const docRef = doc(db, 'settings', 'seo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeoData(docSnap.data());
        } else {
          setSeoData({
            global: {
              title: "Адвокат Дар'я Богдашкіна | Сімейне право Київ",
              description: "Професійні послуги адвоката. Розлучення, аліменти, поділ майна.",
              keywords: "адвокат, київ, сімейне право, розлучення"
            },
            pages: {
              home: { title: "", description: "" },
              services: { title: "", description: "" },
              blog: { title: "", description: "" },
              contacts: { title: "", description: "" }
            },
            tracking: {
              googleAnalyticsId: "",
              googleTagManagerId: "",
              facebookPixelId: ""
            },
            sitemap: {
              autoGenerate: true,
              lastGenerated: null
            }
          });
        }
      } catch (error: any) {
        if (error.message && error.message.includes('offline')) {
          console.warn('SEO settings: Client is offline, using fallback state.');
          setSeoData({
            global: { title: "Адвокат Дар'я Богдашкіна", description: "", keywords: "" },
            pages: { home: {}, services: {}, blog: {}, contacts: {} },
            tracking: { googleAnalyticsId: "", googleTagManagerId: "", facebookPixelId: "" },
            sitemap: { autoGenerate: true }
          });
        } else {
          handleFirestoreError(error, OperationType.GET, 'settings/seo');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'seo'), {
        ...seoData,
        updatedAt: serverTimestamp()
      });
      toast.success('SEO налаштування збережено');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/seo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin opacity-20" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif italic text-[#141414]">SEO та Конфігурація</h2>
          <p className="text-[#141414]/50 font-medium">Керування мета-даними та системами відстеження</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-xl shadow-[#141414]/10"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Зберегти зміни
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Global Meta */}
          <div className="bg-white border border-[#141414]/10 p-8 space-y-6">
            <h3 className="flex items-center gap-3 font-serif italic text-xl border-b border-[#141414]/10 pb-4 mb-6">
              <Globe size={20} className="text-gold" /> Глобальні мета-теги
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Головний Title (за замовчуванням)</label>
                <input 
                  type="text" 
                  value={seoData.global.title}
                  onChange={e => setSeoData({...seoData, global: {...seoData.global, title: e.target.value}})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Meta Description (за замовчуванням)</label>
                <textarea 
                  rows={3}
                  value={seoData.global.description}
                  onChange={e => setSeoData({...seoData, global: {...seoData.global, description: e.target.value}})}
                  className="w-full bg-[#141414]/5 px-4 py-3 outline-none focus:ring-1 ring-[#141414] transition-all text-sm leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Keywords (через кому)</label>
                <input 
                  type="text" 
                  value={seoData.global.keywords}
                  onChange={e => setSeoData({...seoData, global: {...seoData.global, keywords: e.target.value}})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none focus:ring-1 ring-[#141414] transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Social Media Preview */}
          <div className="bg-[#141414] text-white p-8 space-y-6">
            <h3 className="font-serif italic text-xl border-b border-white/10 pb-4 mb-6">Попередній перегляд у Google</h3>
            <div className="space-y-1">
              <p className="text-blue-400 text-lg hover:underline cursor-pointer truncate">{seoData.global.title}</p>
              <p className="text-green-600 text-xs truncate">{window.location.origin}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{seoData.global.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Tracking Services */}
          <div className="bg-white border border-[#141414]/10 p-8 space-y-6">
            <h3 className="flex items-center gap-3 font-serif italic text-xl border-b border-[#141414]/10 pb-4 mb-6">
              <Activity size={20} className="text-gold" /> Аналітика та Відстеження
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Google Analytics 4 (Measurement ID)</label>
                <input 
                  type="text" 
                  placeholder="G-XXXXXXXXXX"
                  value={seoData.tracking.googleAnalyticsId}
                  onChange={e => setSeoData({...seoData, tracking: {...seoData.tracking, googleAnalyticsId: e.target.value}})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-mono text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Google Tag Manager ID</label>
                <input 
                  type="text" 
                  placeholder="GTM-XXXXXXX"
                  value={seoData.tracking.googleTagManagerId}
                  onChange={e => setSeoData({...seoData, tracking: {...seoData.tracking, googleTagManagerId: e.target.value}})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-mono text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Facebook Pixel ID</label>
                <input 
                  type="text" 
                  value={seoData.tracking.facebookPixelId}
                  onChange={e => setSeoData({...seoData, tracking: {...seoData.tracking, facebookPixelId: e.target.value}})}
                  className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Security & technical */}
          <div className="bg-white border border-[#141414]/10 p-8 space-y-6">
            <h3 className="flex items-center gap-3 font-serif italic text-xl border-b border-[#141414]/10 pb-4 mb-6">
              <Shield size={20} className="text-gold" /> Технічні параметри
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#141414]/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Sitemap.xml</p>
                  <p className="text-[10px] text-[#141414]/40 font-medium">Автоматично оновлювати карту сайту</p>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  seoData.sitemap.autoGenerate ? "bg-green-500" : "bg-[#141414]/10"
                )}>
                  <div className={cn(
                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all",
                    seoData.sitemap.autoGenerate ? "translate-x-6" : ""
                  )} />
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={seoData.sitemap.autoGenerate}
                    onChange={e => setSeoData({...seoData, sitemap: {...seoData.sitemap, autoGenerate: e.target.checked}})}
                  />
                </div>
              </label>
              <div className="p-4 border border-dashed border-[#141414]/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-widest">Останнє оновлення Sitemap</span>
                <span className="text-[10px] font-mono font-bold">12.05.2024 14:20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default AdminSEO;
