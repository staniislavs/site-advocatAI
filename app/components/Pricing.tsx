import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const { t } = useTranslation();
  const itemsRaw = t('pricing.items', { returnObjects: true });
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const scrollToContacts = () => {
    const el = document.getElementById('kontakty');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-[var(--bg-primary)] py-12 md:py-20 overflow-hidden">
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
            {t('pricing.tag')}
            <span className="w-8 h-[1px] bg-sage" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-[var(--text-primary)] leading-[1.1] max-w-3xl">
            {t('pricing.title')}
            <span className="text-sage italic font-light"> {t('pricing.title_italic')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
            {t('pricing.description')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end"
        >
          {items.map((item: any, idx: number) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ y: item.featured ? -8 : -4 }}
              className={`group rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col relative ${
                item.featured
                  ? 'bg-sage border border-sage shadow-[0_30px_70px_rgba(94,105,77,0.35)] md:-mt-4 md:pb-10'
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-sage/30 hover:shadow-[0_20px_50px_rgba(94,105,77,0.08)]'
              } ${item.featured ? 'order-first md:order-none' : ''}`}
            >
              {/* Badge for featured */}
              {item.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-sage text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
                    {t('pricing.featured_badge')}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <h3 className={`font-serif text-2xl mb-1.5 ${item.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {item.name}
                </h3>
                <p className={`text-sm ${item.featured ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>
                  {item.description}
                </p>
              </div>

              {/* Price */}
              <div className={`mb-6 pb-5 border-b ${item.featured ? 'border-white/20' : 'border-[var(--card-border)]'}`}>
                <p className={`font-serif font-bold leading-none mb-1 ${
                  item.featured ? 'text-white text-5xl' : 'text-sage text-4xl md:text-5xl'
                }`}>
                  {item.price}
                </p>
                <p className={`text-xs mt-2 ${item.featured ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                  {item.currency}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8 flex-grow">
                {item.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${item.featured ? 'text-white/80' : 'text-sage'}`}
                    />
                    <span className={`text-sm leading-relaxed ${
                      item.featured ? 'text-white/85' : 'text-[var(--text-secondary)]'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={scrollToContacts}
                className={`w-full px-6 py-3.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98] ${
                  item.featured
                    ? 'bg-white text-sage hover:bg-white/92 shadow-sm'
                    : idx === 0
                      ? 'border border-sage text-sage hover:bg-sage hover:text-white'
                      : 'border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-sage hover:text-sage'
                }`}
              >
                {item.featured ? t('pricing.cta.featured') : idx === 0 ? t('pricing.cta.first') : t('pricing.cta.default')}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
