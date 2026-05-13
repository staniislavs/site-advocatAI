import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Save, Loader2, Mail, Send, Bell, Settings, FileCode, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '../../lib/utils';
import { AdminConnections } from './AdminConnections';

export const AdminEmail: React.FC = () => {
  const [emailData, setEmailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'email');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEmailData(docSnap.data());
        } else {
          setEmailData({
            adminNotifications: {
              enabled: true,
              recipient: "bogdashkina.lawyer@gmail.com",
              notifyOnNewLead: true,
              notifyOnNewReview: true
            },
            clientWelcome: {
              subject: "Дякуємо за звернення | Адвокат Дар'я Богдашкіна",
              template: "Добрий день, {{name}}!\n\nДякуємо за ваше звернення. Я ознайомлюся з вашою ситуацією та зателефоную вам найближчим часом.\n\nЗ повагою,\nАдвокат Дар'я Богдашкіна"
            },
            smtp: {
              host: "smtp.gmail.com",
              port: "587",
              user: "",
              pass: "",
              fromEmail: ""
            },
            telegram: {
              botToken: "",
              testChatId: ""
            }
          });
        }
      } catch (error: any) {
        if (error.message && error.message.includes('offline')) {
          console.warn('Email settings: Client is offline, using fallback state.');
          setEmailData({
            adminNotifications: { enabled: true, recipient: "bogdashkina.lawyer@gmail.com" },
            clientWelcome: { subject: "", template: "" },
            smtp: { host: "", port: "", user: "", pass: "", fromEmail: "" },
            telegram: { botToken: "", testChatId: "" }
          });
        } else {
          handleFirestoreError(error, OperationType.GET, 'settings/email');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmailSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'email'), {
        ...emailData,
        updatedAt: serverTimestamp()
      });
      toast.success('Налаштування Email збережено');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/email');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSMTP = async () => {
    const { host, user, pass } = emailData.smtp;
    if (!host || !user || !pass) {
      toast.error('Будь ласка, заповніть усі обов\'язкові поля (Host, Користувач, Пароль)');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(getApiUrl('/api/test-smtp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp: emailData.smtp })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Тестове повідомлення надіслано на вашу пошту');
      } else {
        toast.error(`Помилка: ${data.error}`);
      }
    } catch (error) {
      toast.error('Не вдалося з\'єднатися з сервером');
    } finally {
      setTesting(false);
    }
  };

  const handleTestTelegram = async () => {
    const { botToken, testChatId } = emailData.telegram || {};
    if (!botToken || !testChatId) {
      toast.error('Будь ласка, заповніть токен бота та Chat ID для тесту');
      return;
    }

    setTestingTelegram(true);
    try {
      const response = await fetch(getApiUrl('/api/test-telegram'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId: testChatId })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Тестове повідомлення надіслано в Telegram');
      } else {
        toast.error(`Помилка: ${data.error}`);
      }
    } catch (error) {
      toast.error('Не вдалося з\'єднатися з сервером');
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin opacity-20" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif italic text-[#141414]">Email та Сповіщення</h2>
          <p className="text-[#141414]/50 font-medium">Керування автоматичними листами та налаштування сервера</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#141414] text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414]/90 transition-all shadow-xl shadow-[#141414]/10"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Зберегти всі зміни
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: 'notifications', label: 'Сповіщення адміна', icon: Bell },
            { id: 'channels', label: 'Канали', icon: MessageCircle },
            { id: 'templates', label: 'Шаблони клієнтам', icon: FileCode },
            { id: 'smtp', label: 'SMTP Сервер', icon: Settings },
            { id: 'telegram', label: 'Telegram Бот', icon: Send },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-left",
                activeTab === tab.id 
                  ? "bg-[#141414] text-white shadow-xl" 
                  : "bg-white text-[#141414]/40 hover:bg-[#141414]/5 hover:text-[#141414]"
              )}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          
          <div className="mt-8 p-6 bg-gold/5 border border-gold/10 rounded">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
              <Mail size={12} /> Порада
            </h4>
            <p className="text-[11px] text-[#141414]/60 leading-relaxed font-light italic">
              Ви можете використовувати змінні, такі як {"{{name}}"} або {"{{service}}"}, щоб автоматично підставляти дані з форми у шаблони листів.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'channels' ? (
            <div className="bg-white border border-[#141414]/10 p-2"><AdminConnections /></div>
          ) : (
          <form className="bg-white border border-[#141414]/10 p-8 space-y-8 min-h-[400px]">
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6 text-[#141414]">Сповіщення адміністратора</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#141414]/5">
                    <div>
                      <p className="text-sm font-bold">Email-сповіщення</p>
                      <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Отримувати листи про нові події</p>
                    </div>
                    <label className="relative w-12 h-6 bg-[#141414]/10 rounded-full cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={emailData.adminNotifications.enabled}
                        onChange={e => setEmailData({...emailData, adminNotifications: {...emailData.adminNotifications, enabled: e.target.checked}})}
                      />
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-[#141414]" />
                    </label>
                  </div>

                  <div className="grid gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Основний Email для сповіщень</label>
                      <input 
                        type="email" 
                        value={emailData.adminNotifications.recipient}
                        onChange={e => setEmailData({...emailData, adminNotifications: {...emailData.adminNotifications, recipient: e.target.value}})}
                        className="w-full h-12 bg-[#141414]/5 px-4 outline-none border-b border-transparent focus:border-[#141414] transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Про що сповіщати</label>
                      {[
                        { id: 'notifyOnNewLead', label: 'Нова заявка з сайту' },
                        { id: 'notifyOnNewReview', label: 'Новий відгук (потребує модерації)' },
                      ].map(item => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded-none border-[#141414]/20 text-[#141414] focus:ring-[#141414]" 
                            checked={emailData.adminNotifications[item.id]}
                            onChange={e => setEmailData({...emailData, adminNotifications: {...emailData.adminNotifications, [item.id]: e.target.checked}})}
                          />
                          <span className="text-xs font-medium text-[#141414]/80 group-hover:text-[#141414] transition-colors">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Шаблони для клієнтів</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Тема листа (Дякуємо за звернення)</label>
                    <input 
                      type="text" 
                      value={emailData.clientWelcome.subject}
                      onChange={e => setEmailData({...emailData, clientWelcome: {...emailData.clientWelcome, subject: e.target.value}})}
                      className="w-full h-12 bg-[#141414]/5 px-4 outline-none font-bold italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2">Зміст листа</label>
                    <textarea 
                      rows={10}
                      value={emailData.clientWelcome.template}
                      onChange={e => setEmailData({...emailData, clientWelcome: {...emailData.clientWelcome, template: e.target.value}})}
                      className="w-full bg-[#141414]/5 px-4 py-4 outline-none text-sm leading-relaxed font-serif"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'smtp' && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">SMTP Налаштування</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] uppercase font-bold tracking-widest mb-4">
                      ВАЖЛИВО: Налаштуйте ці параметри лише якщо використовуєте власний поштовий сервер
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">SMTP Host <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={emailData.smtp.host}
                      onChange={e => setEmailData({...emailData, smtp: {...emailData.smtp, host: e.target.value}})}
                      className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10 focus:border-[#141414] transition-all"
                      placeholder="Напр: smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">Port <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={emailData.smtp.port}
                      onChange={e => setEmailData({...emailData, smtp: {...emailData.smtp, port: e.target.value}})}
                      className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">Користувач (Email) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={emailData.smtp.user}
                      onChange={e => setEmailData({...emailData, smtp: {...emailData.smtp, user: e.target.value}})}
                      className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10"
                      placeholder="admin@example.com"
                    />
                    <p className="text-[9px] text-[#141414]/30 mt-1 italic">Для Gmail: вкажіть повну адресу пошти</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">Пароль додатку <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      value={emailData.smtp.pass}
                      onChange={e => setEmailData({...emailData, smtp: {...emailData.smtp, pass: e.target.value}})}
                      className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10"
                    />
                    <p className="text-[9px] text-[#141414]/30 mt-1 italic">Для Gmail: використовуйте 16-значний App Password</p>
                  </div>
                  <div className="col-span-2 pt-4">
                    <button
                      type="button"
                      onClick={handleTestSMTP}
                      disabled={testing}
                      className="w-full md:w-auto px-6 py-3 bg-[#141414]/5 text-[#141414] font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {testing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                      Перевірити з'єднання
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'telegram' && (
              <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                <h3 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4 mb-6">Налаштування Telegram Bot</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-sky-50 border border-sky-100 text-sky-800 text-[10px] uppercase font-bold tracking-widest mb-4">
                    Telegram бот дозволяє отримувати миттєві сповіщення про нові заявки.
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">Telegram Bot Token <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={emailData.telegram?.botToken || ''}
                      onChange={e => setEmailData({
                        ...emailData, 
                        telegram: { ...(emailData.telegram || {}), botToken: e.target.value }
                      })}
                      className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10 focus:border-[#141414] transition-all font-mono"
                      placeholder="123456789:ABCDefGhIJKlmNoPQRsTuvWxYz"
                    />
                    <p className="text-[9px] text-[#141414]/30 mt-1 italic">Отримайте токен у @BotFather</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#141414]/40 mb-2 font-black">Тестовий Chat ID (Ваш ID) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={emailData.telegram?.testChatId || ''}
                        onChange={e => setEmailData({
                          ...emailData, 
                          telegram: { ...(emailData.telegram || {}), testChatId: e.target.value }
                        })}
                        className="w-full h-11 bg-[#141414]/5 px-4 outline-none text-sm border border-[#141414]/10"
                        placeholder="Наприклад: 123456789"
                      />
                      <p className="text-[9px] text-[#141414]/30 mt-1 italic">Введіть числовий ID (отримайте його у @userinfobot)</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="h-11 px-6 bg-[#141414]/5 text-[#141414] font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {testingTelegram ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                      Перевірити бота
                    </button>
                  </div>

                  <div className="mt-8 p-6 bg-white border border-[#141414]/5 rounded-2xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#141414] mb-3">Як налаштувати:</h4>
                    <ol className="text-[11px] text-[#141414]/60 space-y-2 list-decimal ml-4">
                      <li>Створіть бота в Telegram через @BotFather.</li>
                      <li>Скопіюйте <b>API Token</b> і вставте його вище.</li>
                      <li><b>Обов'язково:</b> Зайдіть у свого бота в Telegram і натисніть <b>/start</b>.</li>
                      <li>Дізнайтеся свій числовий <b>Chat ID</b> через бот @userinfobot.</li>
                      <li>Введіть цей ID у поле вище та натисніть "Перевірити бота".</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default AdminEmail;
