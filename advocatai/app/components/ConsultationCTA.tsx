import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Phone, Video, Building2, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="bg-[var(--bg-primary)] py-12 md:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-sage rounded-3xl p-8 md:p-12 text-white overflow-hidden relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <p className="text-white/80 text-[10px] uppercase tracking-[0.2em] font-semibold mb-4">
                {t('consultation.tag')}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.2] mb-6">
                {t('consultation.title')}
                <span className="font-light italic"> {t('consultation.title_italic')}</span>
              </h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-3xl">
                {t('consultation.description')}
              </p>
            </motion.div>

            {/* Features Grid */}
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
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              {features.map((feature: any, idx: number) => {
                const IconComponent = iconMap[feature.icon] || Phone;
                return (
                  <motion.div
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.6 }
                      }
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                        <IconComponent size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-serif text-lg mb-1 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-sage font-sans font-semibold rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
              >
                {t('consultation.cta')}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
