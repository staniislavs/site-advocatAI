import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router';
import { 
  HeartCrack, 
  Users, 
  Scale, 
  Building2,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Baby,
  FileSignature,
  X,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';
import { getExperienceYears } from '../constants';

const icons: Record<string, any> = {
  divorce: <HeartCrack className="w-6 h-6" />,
  alimony: <Users className="w-6 h-6" />,
  property: <Building2 className="w-6 h-6" />,
  children: <Baby className="w-6 h-6" />,
  inheritance: <FileSignature className="w-6 h-6" />,
  domestic_violence: <Scale className="w-6 h-6" />,
  property_rights: <ShieldCheck className="w-6 h-6" />
};

export default function ServicesListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang as LanguageCode) || (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];
  const experienceYears = getExperienceYears();
  const [selectedService, setSelectedService] = useState<any>(null);

  const services = [
    { id: 'divorce', iconKey: 'divorce', featured: true },
    { id: 'property', iconKey: 'property' },
    { id: 'alimony', iconKey: 'alimony' },
    { id: 'children', iconKey: 'children' },
    { id: 'inheritance', iconKey: 'inheritance' },
    { id: 'domestic_violence', iconKey: 'domestic_violence' },
    { id: 'property_rights', iconKey: 'property_rights' }
  ].map((s) => ({
    ...s,
    name: t(`services.items.${s.id}.name`),
    desc: t(`services.items.${s.id}.desc`),
    details: t(`services.items.${s.id}.details`, { returnObjects: true }) as string[],
    slug: (paths.serviceSlugs as any)[s.id]
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12 flex items-center gap-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-gold transition-all"
          >
            <div className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
            </div>
            Назад
          </button>

          <Link 
            to={`/${currentLang}`} 
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-gold transition-all"
          >
            <div className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
            </div>
            На головну
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              <span className="w-8 h-[1px] bg-gold" />
              {t('services.tag')}
            </div>
            <h1 className="font-serif text-5xl md:text-8xl text-[var(--text-primary)] leading-[1.05] tracking-tight">
              {t('services.title')}<br />
              <span className="text-gold italic font-light">{t('services.title_italic')}</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-sm text-sm sm:text-base md:text-xl font-light leading-relaxed mb-2 opacity-80">
             {t('services.description', { years: experienceYears })}
          </p>
        </motion.div>

        {/* Grid matching Services.tsx */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-4 auto-rows-auto md:auto-rows-fr lg:auto-rows-[100px]"
        >
          {services.map((service, idx) => {
            const isFeatured = idx === 0; // Divorce
            const isTall = idx === 1;     // Property
            const isMedium = idx >= 2 && idx <= 4; // Alimony, Custody, Inheritance
            const isWide = idx >= 5;      // Everything else

            let gridClasses = '';
            if (isFeatured) gridClasses = 'md:col-span-4 lg:col-span-8 lg:row-span-3 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] bg-[var(--card-bg)] text-[var(--text-primary)] border-gold/20 shadow-2xl';
            else if (isTall) gridClasses = 'md:col-span-2 lg:col-span-4 lg:row-span-3 bg-[var(--card-bg)] border-[var(--card-border)]';
            else if (isMedium) gridClasses = 'md:col-span-2 lg:col-span-4 lg:row-span-2 bg-[var(--card-bg)] border-[var(--card-border)]';
            else gridClasses = 'md:col-span-2 lg:col-span-6 lg:row-span-2 bg-[var(--card-bg)] border-[var(--card-border)]';
            
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                onClick={() => setSelectedService(service)}
                className={`group cursor-pointer flex flex-col justify-between p-4 md:p-5 rounded-[1.5rem] border transition-all duration-500 relative overflow-hidden
                  hover:border-gold/40 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(184,149,90,0.1)]
                  ${gridClasses}
                `}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700
                  ${isFeatured ? 'bg-gold/10' : 'bg-gold/5'}
                `} />
                
                <div className="relative z-10 flex flex-col h-full w-full">
                  <div className={`mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1rem] flex items-center justify-center transition-all duration-700 relative
                    ${isFeatured 
                      ? 'bg-gold text-[var(--bg-primary)] shadow-[0_10px_30px_rgba(184,149,90,0.4)]' 
                      : 'bg-gold/10 text-gold group-hover:bg-gold group-hover:text-white shadow-sm group-hover:shadow-[0_15px_35px_rgba(184,149,90,0.4)]'}
                  `}>
                    {!isFeatured && (
                      <div className="absolute inset-0 rounded-xl md:rounded-[1rem] bg-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    )}
                    <div className={`relative z-10 transition-transform duration-700 group-hover:scale-110 ${isFeatured ? 'scale-110' : 'scale-90'}`}>
                      {icons[service.iconKey]}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className={`font-serif mb-1 md:mb-2 leading-[1.1] transition-all duration-300
                      ${isFeatured ? 'text-xl md:text-[30px] text-[var(--text-primary)]' : 'text-lg md:text-[27px] text-[var(--text-primary)] group-hover:text-gold'}
                    `}>
                      {service.name}
                    </h3>
                    <p className={`font-sans leading-relaxed transition-all duration-300
                      ${isFeatured ? 'text-[var(--text-secondary)] text-sm md:text-base mb-2 md:mb-4' : 'text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] line-clamp-2'}
                    `}>
                      {service.desc}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between pt-4 md:pt-6 mt-auto border-t
                    ${isFeatured ? 'border-gold/10' : 'border-[var(--card-border)]'}
                  `}>
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors
                      ${isFeatured ? 'text-gold' : 'text-[var(--text-muted)] group-hover:text-gold'}
                    `}>
                      {t('services.more')}
                    </span>
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all
                      ${isFeatured ? 'border-gold/30 bg-gold/5 group-hover:bg-gold group-hover:border-gold' : 'border-[var(--card-border)] group-hover:border-gold group-hover:bg-gold/5'}
                    `}>
                      <ArrowUpRight size={14} className={isFeatured ? 'text-gold group-hover:text-white' : 'text-[var(--text-muted)] group-hover:text-gold'} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Back Link */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="mt-24 flex justify-center"
        >
          <Link 
            to={`/${currentLang}`} 
            className="group inline-flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-full px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-gold hover:border-gold/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform duration-500" />
            </div>
            На головну
          </Link>
        </motion.div>
      </div>

      {/* Detailed Service Modal matching Services.tsx */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 pointer-events-auto"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-2xl"
            />
            
            <motion.div
              layoutId={selectedService.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[var(--bg-secondary)] rounded-[2rem] md:rounded-[3rem] border border-gold/20 shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
            >
              <div className="w-full md:w-2/5 bg-[var(--bg-primary)] relative overflow-hidden p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gold/10">
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gold/5 blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/4 rounded-full" />
                
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedService(null)}
                  className="w-12 h-12 rounded-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 flex items-center justify-center text-[var(--text-primary)]/40 hover:text-gold hover:border-gold/50 transition-all mb-8 self-start"
                >
                  <X size={20} />
                </motion.button>
                
                <div>
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-gold text-[var(--bg-primary)] flex items-center justify-center mb-8 shadow-2xl shadow-gold/20">
                    <div className="scale-125 md:scale-150">{icons[selectedService.iconKey]}</div>
                  </div>
                  <h2 className="font-serif text-3xl md:text-5xl text-[var(--text-primary)] leading-tight mb-6">
                    {selectedService.name}
                  </h2>
                </div>
              </div>

              <div className="w-full md:w-3/5 p-8 md:p-16 bg-[var(--bg-secondary)] overflow-y-auto">
                 <h4 className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
                   <span className="w-6 h-[1px] bg-gold" />
                   {t('services.more')}
                 </h4>
                 
                 <p className="text-[var(--text-primary)] text-lg md:text-2xl font-light leading-relaxed mb-10 opacity-90">
                   {selectedService.desc}
                 </p>

                 <div className="space-y-6">
                   {Array.isArray(selectedService.details) && selectedService.details.map((detail: string, i: number) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        key={i} 
                        className="flex items-start gap-4"
                      >
                       <CheckCircle2 className="text-gold mt-1 flex-shrink-0" size={20} />
                       <span className="text-[var(--text-secondary)] text-sm md:text-lg font-light leading-relaxed">
                         {detail}
                       </span>
                     </motion.div>
                   ))}
                 </div>

                 <div className="mt-16 flex flex-col sm:flex-row gap-6">
                   <Link
                     to={`/${currentLang}/${paths.services}/${selectedService.slug}`}
                     className="inline-flex items-center justify-center gap-3 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] font-bold px-10 py-5 rounded-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 border border-[var(--text-primary)]/10"
                   >
                     {t('services.more')}
                     <ArrowRight size={20} />
                   </Link>
                   <Link 
                     to={`/${currentLang}/${paths.contacts}`}
                     onClick={() => setSelectedService(null)}
                     className="inline-flex items-center justify-center gap-3 bg-gold hover:bg-[#a6844d] text-white font-bold px-10 py-5 rounded-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-gold/30"
                   >
                     {t('services.cta_button')}
                     <ArrowUpRight size={20} />
                   </Link>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
