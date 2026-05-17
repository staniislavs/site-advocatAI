import React, { useState, useEffect } from 'react';
import { Phone, Mail, Facebook, Send, Instagram, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { getApiUrl } from '../lib/utils';

export default function Contacts() {
  const { t } = useTranslation();
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [captcha, setCaptcha] = useState({ n1: 0, n2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: '',
    description: ''
  });

  const generateCaptcha = () => {
    setCaptcha({
      n1: Math.floor(Math.random() * 10) + 1,
      n2: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) {
      toast.error(t('contacts.form.bot_error'));
      return;
    }

    // CAPTCHA check
    if (parseInt(captchaInput) !== captcha.n1 + captcha.n2) {
      toast.error(t('contacts.form.captcha_error'));
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      // 1. Зберігаємо у основну колекцію заявок
      const appRef = await addDoc(collection(db, 'applications'), {
        clientName: formData.name,
        phone: formData.phone,
        serviceType: formData.type || 'General',
        message: formData.description,
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'contact_form'
      });

      // 2. Дублюємо в 'leads' для сумісності з існуючою адмінкою, якщо потрібно
      await addDoc(collection(db, 'leads'), {
        clientName: formData.name,
        phone: formData.phone,
        serviceType: formData.type || 'General',
        message: formData.description,
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'contact_form',
        applicationId: appRef.id
      });

      // Повідомлення тепер надсилається через Firebase Cloud Functions (onCreate на колекції 'applications')
      // Це вирішує проблему CORS на Cloudflare

      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
      toast.success(t('contacts.form.success'));
      setFormData({ name: '', phone: '', type: '', description: '' });
      setCaptchaInput('');
      generateCaptcha();
    } catch (err) {
      console.error('Error adding lead:', err);
      handleFirestoreError(err, OperationType.WRITE, 'leads');
      toast.error('Виникла помилка при відправці. Спробуйте пізніше або зателефонуйте нам.');
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { name: t('contacts.phone'), val: '+38 095 909 89 80', href: 'tel:+380959098980', icon: <Phone size={18} /> },
    { name: t('contacts.telegram'), val: '@Bohdashkina', href: 'https://t.me/Bohdashkina', icon: <Send size={18} /> },
    { name: t('contacts.whatsapp'), val: '+38 095 909 89 80', href: 'https://wa.me/380959098980', icon: <MessageCircle size={18} /> },
    { name: t('contacts.facebook'), val: 'sadvokatom', href: 'https://facebook.com/sadvokatom', icon: <Facebook size={18} /> },
  ];

  return (
    <section id="kontakty" className="pt-0 pb-20 md:pb-32 bg-[var(--bg-primary)] relative overflow-hidden transition-all duration-700">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,105,77,0.02),transparent)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-5 gap-16 md:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-2"
            >
                <div className="inline-flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    {t('contacts.tag')}
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-6">
                    {t('contacts.title')}<span className="text-sage italic">{t('contacts.title_italic')}</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base font-light mb-12 leading-relaxed">
                    {t('contacts.description')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channels.map(ch => (
                    <a 
                      key={ch.name} 
                      href={ch.href}
                      target={ch.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="group flex flex-col items-start gap-3 p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-sage/30 transition-all shadow-sm"
                    >
                        <div className="w-9 h-9 rounded-xl bg-sage/10 text-sage flex items-center justify-center group-hover:scale-110 transition-transform">
                            {ch.icon}
                        </div>
                        <div>
                            <div className="text-[9px] uppercase tracking-wider text-sage font-bold mb-1 opacity-60">{ch.name}</div>
                            <div className="text-[var(--text-primary)] text-[13px] font-medium break-all opacity-90">{ch.val}</div>
                        </div>
                    </a>
                  ))}
                </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 40 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
               className="md:col-span-3 bg-[var(--bg-secondary)] p-8 sm:p-10 md:p-14 rounded-[3rem] border border-[var(--card-border)] shadow-[0_40px_100px_rgba(0,0,0,0.03)] relative overflow-hidden"
            >
                {/* Form decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage/5 blur-3xl pointer-events-none rounded-full" />

                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                  {/* Honeypot Field - Hidden from users */}
                  <div className="hidden" aria-hidden="true">
                    <input 
                      type="text" 
                      tabIndex={-1} 
                      autoComplete="off" 
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)} 
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold ml-1">{t('contacts.form.name')}</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder={t('contacts.form.name_placeholder')}
                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t('contacts.form.required_field'))}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage/50 transition-all placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold ml-1">{t('contacts.form.phone')}</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder={t('contacts.form.phone_placeholder')}
                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t('contacts.form.required_field'))}
                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage/50 transition-all placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold ml-1">{t('contacts.form.type')}</label>
                    <div className="relative group/select">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsTypeOpen(!isTypeOpen)}
                          className={`w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage/50 transition-all ${isTypeOpen ? 'ring-1 ring-sage border-sage/50' : ''}`}
                        >
                          <span className={!formData.type ? 'text-[var(--text-muted)]' : ''}>
                            {formData.type || t('contacts.form.type_placeholder')}
                          </span>
                          <div className={`text-sage/60 group-hover/select:text-sage transition-all duration-300 ${isTypeOpen ? 'rotate-180 text-sage' : ''}`}>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>

                        {/* Custom Dropdown Menu */}
                        <AnimatePresence>
                          {isTypeOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-20" 
                                onClick={() => setIsTypeOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden z-30"
                              >
                                {[
                                  { key: 'divorce', label: t('contacts.form.types.divorce') },
                                  { key: 'alimony', label: t('contacts.form.types.alimony') },
                                  { key: 'property', label: t('contacts.form.types.property') },
                                  { key: 'custody', label: t('contacts.form.types.custody') },
                                  { key: 'inheritance', label: t('contacts.form.types.inheritance') },
                                  { key: 'other', label: t('contacts.form.types.other') }
                                ].map((option) => (
                                  <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, type: option.label });
                                      setIsTypeOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between group/option ${
                                      formData.type === option.label 
                                      ? 'bg-sage/10 text-sage' 
                                      : 'text-[var(--text-primary)] hover:bg-sage/5 hover:text-sage'
                                    }`}
                                  >
                                    {option.label}
                                    {formData.type === option.label && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                                    )}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold ml-1">{t('contacts.form.description')}</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder={t('contacts.form.desc_placeholder')}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage/50 transition-all placeholder:text-[var(--text-muted)] resize-none"
                    ></textarea>
                  </div>

                  {/* Anti-spam Math Captcha */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold ml-1">
                      {t('contacts.form.captcha_label', { num1: captcha.n1, num2: captcha.n2 })}
                    </label>
                    <input 
                      type="number" 
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder={t('contacts.form.captcha_placeholder')}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage/50 transition-all placeholder:text-[var(--text-muted)]"
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-sage hover:bg-sage-bright disabled:opacity-50 disabled:cursor-wait text-white font-bold py-5 rounded-xl transition-all shadow-xl shadow-sage/10 mt-4 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {t('contacts.form.submit')}
                  </button>
                  
                  <div className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
                    {t('contacts.form.agreement')}
                  </div>
                </form>
            </motion.div>
        </div>
    </section>
  );
}
