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
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {items.map((item: any) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`group rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col ${
                item.featured
                  ? 'bg-sage text-white border border-sage shadow-[0_20px_50px_rgba(94,105,77,0.3)]'
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] hover:border-sage/30 hover:shadow-[0_20px_50px_rgba(94,105,77,0.1)]'
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                <h3 className={`font-serif text-2xl mb-2 ${item.featured ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {item.name}
                </h3>
                <p className={`text-sm ${item.featured ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {item.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className={`text-4xl md:text-5xl font-serif font-bold mb-1 ${item.featured ? 'text-white' : 'text-sage'}`}>
                  {item.price}
                </p>
                <p className={`text-sm ${item.featured ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {item.currency}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8 flex-grow">
                {item.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${item.featured ? 'text-white' : 'text-sage'}`}
                    />
                    <span className={`text-sm leading-relaxed ${item.featured ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all ${
                  item.featured
                    ? 'bg-white text-sage hover:bg-white/90'
                    : 'bg-sage text-white hover:bg-sage/90'
                }`}
              >
                {t('contacts.form.submit')}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
