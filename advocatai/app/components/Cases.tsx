import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, DollarSign } from 'lucide-react';

export default function Cases() {
  const { t } = useTranslation();

  const cases = [
    {
      id: 1,
      type: t('cases.items.0.type'),
      year: t('cases.items.0.year'),
      status: t('cases.items.0.status'),
      title: t('cases.items.0.title'),
      description: t('cases.items.0.description'),
      duration: t('cases.items.0.duration'),
      durationValue: t('cases.items.0.durationValue'),
      cost: t('cases.items.0.cost'),
      costValue: t('cases.items.0.costValue')
    },
    {
      id: 2,
      type: t('cases.items.1.type'),
      year: t('cases.items.1.year'),
      status: t('cases.items.1.status'),
      title: t('cases.items.1.title'),
      description: t('cases.items.1.description'),
      duration: t('cases.items.1.duration'),
      durationValue: t('cases.items.1.durationValue'),
      cost: t('cases.items.1.cost'),
      costValue: t('cases.items.1.costValue')
    },
    {
      id: 3,
      type: t('cases.items.2.type'),
      year: t('cases.items.2.year'),
      status: t('cases.items.2.status'),
      title: t('cases.items.2.title'),
      description: t('cases.items.2.description'),
      duration: t('cases.items.2.duration'),
      durationValue: t('cases.items.2.durationValue'),
      cost: t('cases.items.2.cost'),
      costValue: t('cases.items.2.costValue')
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
    <section id="cases" className="bg-[var(--bg-primary)] py-12 md:py-20 overflow-hidden">
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
            {t('cases.tag')}
            <span className="w-8 h-[1px] bg-sage" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-[var(--text-primary)] leading-[1.1] max-w-3xl">
            {t('cases.title')}
            <span className="text-sage italic font-light"> {t('cases.title_italic')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
            {t('cases.description')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {cases.map((caseItem) => (
            <motion.div
              key={caseItem.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 transition-all duration-500 hover:border-sage/30 hover:shadow-[0_20px_50px_rgba(94,105,77,0.1)]"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-[var(--card-border)]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">
                      {caseItem.type} · {caseItem.year}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-sage font-semibold">
                      <CheckCircle2 size={14} />
                      {caseItem.status}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="font-serif text-xl md:text-2xl text-[var(--text-primary)] mb-4 leading-tight">
                  {caseItem.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-grow">
                  {caseItem.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--card-border)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-sage" />
                      <span className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.1em] font-semibold">
                        {caseItem.duration}
                      </span>
                    </div>
                    <p className="text-base font-serif text-[var(--text-primary)]">
                      {caseItem.durationValue}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-sage" />
                      <span className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.1em] font-semibold">
                        {caseItem.cost}
                      </span>
                    </div>
                    <p className="text-base font-serif text-[var(--text-primary)]">
                      {caseItem.costValue}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
