import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { ShieldCheck, MapPin, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getExperienceYears } from '../constants';

interface RevealTextProps {
  text: string;
  className?: string;
}

function RevealText({ text, className }: RevealTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const words = (text || "").split(" ");
  
  return (
    <span ref={ref} className={`${className} inline-block`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function About() {
  const { t } = useTranslation();
  const experienceYears = getExperienceYears();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const highlights = [
    {
      title: t('about.highlights.licensed.title'),
      sub: t('about.highlights.licensed.sub'),
      icon: <ShieldCheck size={20} className="text-sage" />
    },
    {
      title: t('about.highlights.quick.title'),
      sub: t('about.highlights.quick.sub'),
      icon: <PhoneCall size={20} className="text-sage" />
    }
  ];

  return (
    <section ref={containerRef} id="pro-mene" className="bg-[var(--bg-secondary)] relative overflow-hidden transition-all duration-700">
      <div className="max-w-4xl mx-auto px-6 py-24 md:py-40">
        
        {/* Content */}
        <motion.div style={{ y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : textY }} className="w-full space-y-12">
          <div className="max-w-2xl mx-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              {t('about.tag')}
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-8 md:mb-10">
              <RevealText text={t('about.title')} />
            </h2>

            <div className="space-y-6 md:space-y-8 text-sm sm:text-base md:text-lg font-light leading-relaxed text-[var(--text-secondary)]">
              <RevealText 
                text={t('about.p1', { years: experienceYears })} 
              />
              <RevealText 
                text={t('about.p2')} 
              />
              <RevealText 
                text={t('about.p3')} 
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {highlights.map((h, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-sage/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-full bg-sage/5 text-sage flex items-center justify-center flex-shrink-0 transition-all duration-500">
                  {h.icon}
                </div>
                <div>
                   <div className="text-[var(--text-primary)] text-sm font-medium">{h.title}</div>
                   <div className="text-[var(--text-muted)] text-[11px] mt-0.5">{h.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <a href="#kontakty" className="bg-sage hover:bg-sage-bright/95 text-white font-bold px-10 py-4 rounded-full inline-block transition-all shadow-xl shadow-sage/10 active:scale-95">
              {t('about.cta')}
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
