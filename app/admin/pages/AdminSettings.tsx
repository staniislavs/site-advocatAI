import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Save, 
  Loader2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin,
  User,
  Layout
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        } else {
          // Default layout
          setSettings({
            siteName: "Адвокат Дар'я Богдашкіна",
            siteRole: "Спеціаліст у сімейних та цивільних справах",
            about: {
              title: "Професійна правова допомога",
              text: "Я допомагаю клієнтам у вирішенні найскладніших юридичних питань...",
            },
            contacts: {
              phone: "+38 (095) 123 45 67",
              email: "bogdashkina.lawyer@gmail.com",
              address: "м. Київ, вул. Велика Васильківська, 100",
              facebook: "",
              instagram: "",
              linkedin: ""
            },
            seo: {
              title: "Адвокат Дар'я Богдашкіна | Сімейне право Київ",
              description: "Професійні послуги адвоката у Києві. Розлучення, аліменти, поділ майна.",
              keywords: "адвокат, сімейне право, онлайн консультація"
            }
          });
        }
      } catch (error: any) {
        if (error.message && error.message.includes('offline')) {
          console.warn('Global settings: Client is offline, using fallback state.');
          setSettings({
            siteName: "Адвокат Дар'я Богдашкіна",
            siteRole: "Адвокат",
            about: { title: "", text: "" },
            contacts: { phone: "", email: "", address: "" },
            seo: { title: "", description: "", keywords: "" }
          });
        } else {
          handleFirestoreError(error, OperationType.GET, 'settings/global');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      alert('Налаштування успішно збережено');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#141414]/20" size={48} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">Завантаження конфігурації...</span>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'Головна', icon: Globe },
    { id: 'about', label: 'Про мене', icon: User },
    { id: 'contacts', label: 'Контакти', icon: MapPin },
    { id: 'design', label: 'Дизайн та Секції', icon: Layout },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif italic text-[#141414]">Налаштування</h1>
          <p className="text-[#141414]/50 font-medium">Конфігурація глобальних параметрів сайту</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-xl"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Зберегти всі зміни
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 border border-[#141414]/10 bg-white h-fit">
          <div className="p-4 border-b border-[#141414]/10 bg-[#141414]/[0.02]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 text-center block">Розділи налаштувань</span>
          </div>
          <nav className="flex flex-col">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all text-left",
                  activeTab === tab.id 
                    ? "bg-[#141414] text-white" 
                    : "text-[#141414]/60 hover:bg-[#141414]/5"
                )}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-3">
          <form className="bg-white border border-[#141414]/10 p-8 space-y-8 min-h-[500px]">
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Основна інформація</h3>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Назва (Заголовок сайту)</label>
                    <input 
                      type="text" 
                      value={settings.siteName}
                      onChange={e => setSettings({...settings, siteName: e.target.value})}
                      className="w-full h-12 bg-[#141414]/5 px-4 outline-none border-b border-transparent focus:border-[#141414] transition-all font-serif italic text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Підзаголовок / Роль</label>
                    <input 
                      type="text" 
                      value={settings.siteRole}
                      onChange={e => setSettings({...settings, siteRole: e.target.value})}
                      className="w-full h-12 bg-[#141414]/5 px-4 outline-none border-b border-transparent focus:border-[#141414] transition-all font-bold uppercase tracking-widest text-[10px]"
                    />
                  </div>
                  <div className="pt-4 border-t border-[#141414]/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Режим технічного обслуговування</h4>
                      <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Тимчасово закрити сайт для відвідувачів</p>
                    </div>
                    <label className="relative w-12 h-6 bg-[#141414]/10 rounded-full cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={settings.maintenanceMode || false}
                        onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                      />
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-red-500" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Дизайн та Відображення</h3>
                <div className="grid gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Основний колір бренду</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={settings.primaryColor || '#C4A484'}
                        onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                        className="w-16 h-16 border-none cursor-pointer bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={settings.primaryColor || '#C4A484'}
                        onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                        className="h-12 bg-[#141414]/5 px-4 outline-none font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Активні розділи сайту</label>
                    {[
                      { id: 'showFAQ', label: 'Часті запитання (FAQ)' },
                      { id: 'showReviews', label: 'Відгуки клієнтів' },
                      { id: 'showBlog', label: 'Блог / Статті' },
                      { id: 'showCookieBanner', label: 'Cookie Banner' },
                    ].map(section => (
                      <div key={section.id} className="flex items-center justify-between p-4 bg-[#141414]/5">
                        <span className="text-sm font-medium">{section.label}</span>
                        <label className="relative w-10 h-5 bg-[#141414]/10 rounded-full cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={settings[section.id] ?? true}
                            onChange={e => setSettings({...settings, [section.id]: e.target.checked})}
                          />
                          <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-[#141414]" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Секція "Про мене"</h3>
                <div className="grid gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Заголовок блоку</label>
                    <input 
                      type="text" 
                      value={settings.about.title}
                      onChange={e => setSettings({...settings, about: {...settings.about, title: e.target.value}})}
                      className="w-full h-12 bg-[#141414]/5 px-4 outline-none border-b border-transparent focus:border-[#141414] transition-all font-serif italic text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Основний текст</label>
                    <textarea 
                      rows={8}
                      value={settings.about.text}
                      onChange={e => setSettings({...settings, about: {...settings.about, text: e.target.value}})}
                      className="w-full bg-[#141414]/5 px-4 py-4 outline-none border-b border-transparent focus:border-[#141414] transition-all text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Контактна інформація</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <Phone size={12} /> Телефон
                      </label>
                      <input 
                        type="text" 
                        value={settings.contacts.phone}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, phone: e.target.value}})}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <Mail size={12} /> Email
                      </label>
                      <input 
                        type="email" 
                        value={settings.contacts.email}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, email: e.target.value}})}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <MapPin size={12} /> Адреса офісу
                      </label>
                      <textarea 
                        rows={2}
                        value={settings.contacts.address}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, address: e.target.value}})}
                        className="w-full bg-[#141414]/5 px-4 py-2 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <Facebook size={12} /> Facebook Link
                      </label>
                      <input 
                        type="text" 
                        value={settings.contacts.facebook}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, facebook: e.target.value}})}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <Instagram size={12} /> Instagram Link
                      </label>
                      <input 
                        type="text" 
                        value={settings.contacts.instagram}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, instagram: e.target.value}})}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">
                        <Linkedin size={12} /> LinkedIn Link
                      </label>
                      <input 
                        type="text" 
                        value={settings.contacts.linkedin}
                        onChange={e => setSettings({...settings, contacts: {...settings.contacts, linkedin: e.target.value}})}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
