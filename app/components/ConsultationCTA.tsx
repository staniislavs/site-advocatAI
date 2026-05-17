import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Phone, Video, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

const iconMap: Record<string, any> = {
  phone: Phone,
  video: Video,
  office: Building2,
  check: CheckCircle2
};

export default function ConsultationCTA() {
  const { t } = useTranslation();
  const featuresRaw = t('consultation.features', { returnObjects: true });
  const features = Array.isArray(featuresRaw) ? featuresRaw : [];

  const scrollToContacts = () => {
    const el = document.getElementById('kontakty');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-[var(--bg-primary)] py-12 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-sage rounded-3xl overflow-hidden relative"
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 pointer-events-none hidden lg:block" />

          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            {/* Tag */}
            <p className="text-white/60 text-[10px] uppercase tracking-[0.25em] font-semibold mb-5">
              {t('consultation.tag')}
            </p>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-[1.15] mb-5 max-w-2xl">
              {t('consultation.title')}
              <span className="italic font-light">{t('consultation.title_italic')}</span>
            </h2>

            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
              {t('consultation.description')}
            </p>

            {/* Features */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10"
            >
              {features.map((feature: any, idx: number) => {
                const Icon = iconMap[feature.icon] || Phone;
                return (
                  <motion.div
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, x: -16 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                    }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">{feature.title}</p>
                      <p className="text-white/60 text-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.button
              onClick={scrollToContacts}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-sage font-semibold rounded-xl hover:bg-white/93 transition-all shadow-lg hover:shadow-xl text-sm"
            >
              {t('consultation.cta')}
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
