import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { X, CheckCircle2, ArrowRight, ArrowUpRight } from 'lucide-react';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

interface ServiceModalProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
  icons: Record<string, any>;
}

export default function ServiceModal({ service, isOpen, onClose, icons }: ServiceModalProps) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
        >
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-2xl" onClick={onClose} />
          
          <motion.div
            layoutId={service.id}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-5xl bg-surface rounded-2xl border border-sage/20 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual Side */}
            <div className="w-full md:w-2/5 bg-bg relative p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-line">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 blur-[100px] -translate-y-1/2 translate-x-1/4 rounded-full" />
              <button onClick={onClose} className="w-12 h-12 rounded-full bg-ink/5 border border-line flex items-center justify-center text-ink-3 hover:text-sage hover:border-sage transition-all mb-12 self-start">
                <X size={20} />
              </button>
              <div>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-sage text-bg flex items-center justify-center mb-8 shadow-xl shadow-sage/20">
                  <div className="scale-150">{icons[service.iconKey]}</div>
                </div>
                <h2 className="font-serif text-3xl md:text-5xl text-ink leading-tight mb-4">{service.name}</h2>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-3/5 p-8 md:p-16 bg-surface overflow-y-auto">
              <h4 className="eyebrow text-sage !text-[10px] mb-8 flex items-center gap-3">
                <span className="w-6 h-[1px] bg-sage" />
                {t('services.more')}
              </h4>
              <p className="text-ink text-lg md:text-xl font-light leading-relaxed mb-10 opacity-90">{service.desc}</p>
              <div className="space-y-4">
                {service.details?.map((detail: string, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="text-sage mt-1 shrink-0" size={18} />
                    <span className="text-ink-2 text-sm md:text-base font-light">{detail}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link to={`/${currentLang}/${paths.services}/${service.slug}`} className="inline-flex items-center justify-center gap-3 bg-surface-2 hover:bg-surface-3 text-ink px-10 py-5 rounded-full eyebrow !text-[10px] transition-all border border-line">
                  Повна сторінка <ArrowRight size={18} />
                </Link>
                <Link to={`/${currentLang}/${paths.contacts}`} className="inline-flex items-center justify-center gap-3 bg-ink hover:bg-ink-2 text-bg px-10 py-5 rounded-full eyebrow !text-[10px] transition-all shadow-xl shadow-sage/20">
                  {t('services.cta_button')} <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
