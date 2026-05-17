import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare, X, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn, getApiUrl } from '../lib/utils';

interface Review {
  id: string;
  name: string;
  text: string;
  date: string;
  rating?: number;
  isApproved?: boolean;
}

export const Reviews: React.FC = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024); // 1024 is lg in tailwind
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group reviews into slides
  const slides: Review[][] = [];
  const chunkSize = isMobile ? 1 : 2;
  for (let i = 0; i < reviews.length; i += chunkSize) {
    slides.push(reviews.slice(i, i + chunkSize));
  }

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    // Try to fetch approved reviews from Firestore
    const q = query(
      collection(db, 'reviews'), 
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20) // Increased limit to have more pairs
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        setReviews(data);
      } else {
        // Fallback to i18n reviews if collection is empty
        const fallbackReviews = t('reviews.items', { returnObjects: true }) as any[];
        if (Array.isArray(fallbackReviews)) {
          setReviews(fallbackReviews.map((r, i) => ({ ...r, id: `fallback-${i}` })));
        }
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firestore reviews fetch failed, using fallback:', error);
      const fallbackReviews = t('reviews.items', { returnObjects: true }) as any[];
      if (Array.isArray(fallbackReviews)) {
        setReviews(fallbackReviews.map((r, i) => ({ ...r, id: `fallback-${i}` })));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [t]);

  const next = () => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prev = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const now = new Date();
      const monthNames = [
        "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
      ];
      const dateStr = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        date: dateStr,
        isApproved: false, // Default to false for moderation
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Також записуємо в applications для тригера сповіщення в Telegram
      await addDoc(collection(db, 'applications'), {
        clientName: newReview.name,
        phone: 'Відгук',
        serviceType: 'Новий відгук',
        message: `Рейтинг: ${newReview.rating}/5. Текст: ${newReview.text}`,
        status: 'new',
        createdAt: serverTimestamp(),
        source: 'review_form'
      });

      // Повідомлення тепер надсилається через Firebase Cloud Functions
      // Це вирішує проблему CORS на Cloudflare

      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setNewReview({ name: '', text: '', rating: 5 });
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && reviews.length === 0) return null;
  if (reviews.length === 0) return null;

  return (
    <section id="vidhuky" className="py-24 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-px bg-sage" />
              <span className="text-sage uppercase tracking-[0.3em] text-[10px] font-bold">
                {t('reviews.tag')}
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-[var(--text-primary)] leading-tight"
            >
              {t('reviews.title')}<span className="italic text-sage">{t('reviews.title_italic')}</span>
            </motion.h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={prev}
              className="w-14 h-14 rounded-full border border-sage/20 flex items-center justify-center text-sage hover:bg-sage hover:text-white transition-all group"
            >
              <ChevronLeft size={24} className="group-active:scale-90 transition-transform" />
            </button>
            <button 
              onClick={next}
              className="w-14 h-14 rounded-full border border-sage/20 flex items-center justify-center text-sage hover:bg-sage hover:text-white transition-all group"
            >
              <ChevronRight size={24} className="group-active:scale-90 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative min-h-[500px] md:min-h-[400px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? 100 : -100,
                  opacity: 0,
                  scale: 0.98
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1,
                  scale: 1
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 100 : -100,
                  opacity: 0,
                  scale: 0.98
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 150, damping: 25 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
                {(slides[currentSlide] || []).map((review, idx) => (
                  <div key={review.id || idx} className="relative bg-[var(--bg-secondary)]/30 backdrop-blur-sm p-8 md:p-12 border border-sage/5 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left group hover:border-sage/20 transition-all duration-500">
                    <Quote className="absolute -top-6 left-12 text-sage/5 w-20 h-20 -z-10 group-hover:text-sage/10 transition-colors" />
                    <div className="space-y-6 flex flex-col items-center lg:items-start w-full">
                      <div className="flex gap-1 justify-center lg:justify-start">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-sage text-sage" />
                        ))}
                      </div>
                      <p className="text-base md:text-lg lg:text-xl font-serif text-[var(--text-primary)] italic leading-relaxed min-h-[6rem]">
                        "{review.text}"
                      </p>
                      <div className="pt-6 border-t border-sage/10 flex items-center justify-center lg:justify-start gap-4 w-full">
                        <div className="w-10 h-10 bg-sage/5 rounded-full flex items-center justify-center text-sage border border-sage/10 group-hover:bg-sage group-hover:text-white transition-all">
                          <MessageSquare size={20} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-base font-bold text-[var(--text-primary)]">{review.name}</h4>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-[0.1em]">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-3 mt-12 mb-16">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 1 : -1);
                setCurrentSlide(i);
              }}
              className={`h-1.5 transition-all duration-700 rounded-full ${currentSlide === i ? 'w-12 bg-sage' : 'w-3 bg-sage/20'}`}
            />
          ))}
        </div>

        {/* Leave Review Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-10 py-4 bg-sage hover:bg-sage-bright/95 text-white rounded-full transition-all duration-500 shadow-xl shadow-sage/10 active:scale-95 flex items-center gap-3"
          >
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold uppercase tracking-[0.2em] text-[11px]">
              Залишити відгук
            </span>
          </button>
        </motion.div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-white p-8 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden border border-[#141414]/5"
            >
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-sage/5 blur-3xl -z-10" />
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-[#141414]/20 hover:text-sage transition-all p-2 hover:bg-[#141414]/5 rounded-full"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>

              {submitted ? (
                <div className="text-center py-16 space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto text-sage mb-8"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <h3 className="text-3xl md:text-4xl font-serif text-[#141414] italic">
                    {t('reviews.modal.thanks_title', { defaultValue: 'Дякуємо за довіру' })}
                  </h3>
                  <div className="w-12 h-px bg-sage/30 mx-auto" />
                  <p className="text-[#141414]/60 text-base font-light leading-relaxed max-w-sm mx-auto">
                    {t('reviews.modal.thanks_text', { defaultValue: 'Ваш відгук буде опубліковано після короткої модерації.' })}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-12 text-center md:text-left">
                    <h3 className="text-4xl md:text-5xl font-serif text-[#141414] mb-4 italic leading-tight">
                      Поділіться досвідом
                    </h3>
                    <div className="w-12 h-px bg-sage/30 mx-auto md:mx-0 mb-4" />
                    <p className="text-[#141414]/40 text-[9px] uppercase tracking-[0.3em] font-bold">
                      Ваша думка важлива для нас
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-sage font-bold ml-1">Ім'я та Прізвище</label>
                      <input 
                        required
                        type="text"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full bg-[#fdfdfd] border border-[#141414]/5 rounded-2xl px-6 py-4 outline-none focus:border-sage/30 transition-all text-[#141414] font-serif italic text-lg"
                        placeholder="Олена Савченко"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-sage font-bold ml-1">Оцінка роботи</label>
                      <div className="flex gap-3 justify-center md:justify-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star 
                              size={28} 
                              className={cn(
                                "transition-all duration-300",
                                newReview.rating >= star ? "fill-sage text-sage" : "text-sage/10 scale-90"
                              )} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.3em] text-sage font-bold ml-1">Ваш відгук</label>
                      <textarea 
                        required
                        rows={5}
                        value={newReview.text}
                        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                        className="w-full bg-[#fdfdfd] border border-[#141414]/5 rounded-2xl px-6 py-4 outline-none focus:border-sage/30 transition-all text-[#141414] font-serif italic resize-none text-lg leading-relaxed"
                        placeholder="Напишіть ваші враження від співпраці..."
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 bg-sage text-white font-bold uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-sage-bright/95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-xl shadow-sage/20"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <span className="flex items-center gap-3">
                          Надіслати відгук
                          <ArrowRight size={16} />
                        </span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Decorative */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-sage/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 blur-[80px] rounded-full -z-10" />
    </section>
  );
};
