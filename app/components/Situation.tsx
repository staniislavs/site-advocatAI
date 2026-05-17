import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function Situation() {
  const { t } = useTranslation();

  const situations = [
    {
      id: 1,
      quote: t('situation.items.0.quote'),
      description: t('situation.items.0.description')
    },
    {
      id: 2,
      quote: t('situation.items.1.quote'),
      description: t('situation.items.1.description')
    },
    {
      id: 3,
      quote: t('situation.items.2.quote'),
      description: t('situation.items.2.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="situation" className="bg-[var(--bg-primary)] py-12 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-3 text-sage text-[10px] font-semibold uppercase tracking-[0.2em] mb-6">
            <span className="w-8 h-[1px] bg-sage" />
            {t('situation.tag')}
            <span className="w-8 h-[1px] bg-sage" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-[var(--text-primary)] leading-[1.1] max-w-3xl">
            {t('situation.title')}
            <span className="text-sage italic font-light"> {t('situation.title_italic')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
            {t('situation.description')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {situations.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 transition-all duration-500 hover:border-sage/30 hover:shadow-[0_20px_50px_rgba(94,105,77,0.1)]"
            >
              <blockquote className="font-serif text-lg md:text-xl italic text-sage leading-relaxed mb-4">
                "{item.quote}"
              </blockquote>
              <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
