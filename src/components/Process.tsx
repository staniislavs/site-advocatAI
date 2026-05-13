import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function Process() {
  const { t } = useTranslation();

  const items = t('process.items', { returnObjects: true }) as Array<{ id: string, name: string, desc: string }>;

  return (
    <section id="process" className="py-16 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-medium mb-6"
          >
            {t('process.subtitle')}
          </motion.p>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-[52px] lg:text-[52px] font-serif leading-[1.1] text-[var(--text-primary)] max-w-3xl"
          >
            {t('process.title_1')}<br />
            {t('process.title_2')}
            <span className="text-gold italic">{t('process.title_italic')}</span>
          </motion.h2>
        </div>

        {/* Divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[1px] bg-[var(--text-primary)]/10 mb-8 md:mb-10 origin-left"
        />

        {/* Steps Grid */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              className="flex flex-col group relative p-6 md:p-8 rounded-[1.5rem] bg-[var(--bg-secondary)]/30 border border-[var(--card-border)] hover:border-gold/30 hover:bg-[var(--bg-secondary)] transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-6 block group-hover:text-gold transition-colors duration-500">
                {idx + 1}
              </span>
              
              <h3 className="text-xl md:text-[22px] font-serif text-[var(--text-primary)] mb-4 leading-tight group-hover:translate-x-1 transition-transform duration-500">
                {item.name}
              </h3>
              
              <p className="text-[var(--text-secondary)] leading-relaxed text-[13px] lg:text-sm font-light opacity-80 group-hover:opacity-100 transition-opacity">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
