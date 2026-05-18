import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { buildFaqSchema } from './JsonLd';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  blockSettings?: { maxItems?: number };
}

export default function FAQ({ blockSettings }: FAQProps = {}) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const maxItems = blockSettings?.maxItems ?? 10;
  const localizedFaqsRaw = t('faq.items', { returnObjects: true });
  const localizedFaqsAll = Array.isArray(localizedFaqsRaw) ? localizedFaqsRaw : [];
  const localizedFaqs = localizedFaqsAll.slice(0, maxItems);

  const faqSchema = useMemo(
    () => buildFaqSchema(localizedFaqs),
    [localizedFaqs]
  );

  return (
    <>
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
    <section id="faq" className="py-24 md:py-32 bg-[var(--bg-primary)] border-t border-[var(--card-border)]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
            {t('faq.tag')}
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)]">
            {t('faq.title')} <span className="text-sage italic">{t('faq.title_italic')}</span>
          </h2>
        </div>

        <div className="space-y-4">
          {localizedFaqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-2xl transition-all duration-300 ${
                openIndex === idx ? 'bg-[var(--bg-secondary)] border-sage/30 shadow-md' : 'bg-transparent border-[var(--card-border)] hover:border-sage/30'
              }`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 group"
              >
                <span className={`font-serif text-lg leading-tight transition-colors ${
                  openIndex === idx ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}>
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-sage/30 flex items-center justify-center transition-transform duration-300 ${
                  openIndex === idx ? 'rotate-45 bg-sage/10' : ''
                }`}>
                  <Plus size={16} className="text-sage" />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-[var(--text-secondary)] font-light text-sm leading-relaxed border-t border-[var(--card-border)] pt-4 mx-6">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
