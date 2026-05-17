import React from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

export default function ServiceDetail() {
  const params = useParams();
  const lang = params.lang;
  const slug = params.id || params.category;
  const { t, i18n } = useTranslation();

  const currentLang = (lang as LanguageCode) || (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  // Find service ID by slug
  const serviceId = Object.entries(paths.serviceSlugs).find(([_, s]) => s === slug)?.[0];

  const servicesKeys = [
    'divorce',
    'property',
    'alimony',
    'children',
    'inheritance',
    'domestic_violence',
    'property_rights'
  ];

  // If service ID is not found, we could redirect or show a 404
  if (!serviceId || !servicesKeys.includes(serviceId)) {
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="text-3xl font-serif">Послугу не знайдено</h1>
        <Link to={`/${currentLang}`} className="text-sage mt-4 inline-block">Повернутися на головну</Link>
      </div>
    );
  }

  const serviceData = t(`services.items.${serviceId}`, { returnObjects: true }) as any;

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          <Link to={`/${currentLang}`} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-sage transition-colors mb-12 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t('blog.back')}</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="lg:col-span-2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-8">
              {serviceData.name}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed mb-12">
              {serviceData.desc}
            </p>

            {serviceData.content && (
              <div className="mb-16 prose prose-lg prose-stone dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                  {serviceData.content}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-16">
              {serviceData.details?.map((detail: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-sage/30 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-sage" />
                  </div>
                  <span className="text-lg leading-relaxed">{detail}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="h-fit lg:sticky lg:top-32"
          >
            <div className="bg-[var(--bg-secondary)] p-8 rounded-[2rem] border border-[var(--card-border)] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <ShieldCheck size={40} className="text-sage mb-6" />
                 <h3 className="text-2xl font-serif mb-4">Потрібна допомога?</h3>
                 <p className="text-[var(--text-secondary)] mb-8">
                   Запишіться на безкоштовну консультацію з Дар'єю Богдашкіною для обговорення вашої ситуації.
                 </p>
                 <Link 
                   to={`/${currentLang}/${paths.contacts}`} 
                   className="block w-full text-center py-4 rounded-xl bg-sage text-[var(--bg-secondary)] font-medium hover:bg-sage-dark transition-all"
                 >
                   {t('services.cta_button')}
                 </Link>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
