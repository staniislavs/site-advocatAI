import { useRef, ElementType } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Star, MessageSquare, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { getExperienceYears } from '../constants';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

interface RevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: ElementType;
}

function Reveal({ text, className, delay = 0, as: Component = "span" }: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const words = (text || "").split(" ");
  
  return (
    <Component ref={ref} className={`${className} inline-block`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}

export default function Hero() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const experienceYears = getExperienceYears();
  const targetRef = useRef<HTMLDivElement>(null);
  const currentLang = (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  const handleConsultationClick = (e: React.MouseEvent) => {
    const isHomePage = location.pathname === `/${currentLang}` || location.pathname === `/${currentLang}/`;
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById('kontakty');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL to match without full route reload
        window.history.pushState({}, '', `/${currentLang}/${paths.contacts}`);
      }
    }
  };
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section id="hero" ref={targetRef} className="relative min-h-[100vh] md:min-h-[82vh] flex items-center overflow-hidden pt-20">
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ scale }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          <video
            autoPlay
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover opacity-30 dark:opacity-20 grayscale-[0.4] contrast-[1.1]"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        {/* Elegant Gradient Overlays for Harmony */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
        <div className="absolute inset-0 bg-[var(--bg-primary)]/20 backdrop-blur-[2px]" />
      </div>

      {/* Background Decor */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 300]) }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full bg-sage/3 blur-[120px] pointer-events-none z-[1]" 
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
        className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[70%] rounded-full bg-sage/5 blur-[100px] pointer-events-none z-[1]" 
      />
      <div className="absolute inset-0 bg-transparent pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 relative z-10">
        <motion.div style={{ y, opacity }} className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/5 border border-sage/10 text-sage text-[9px] font-bold uppercase tracking-[0.3em] mb-8 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            {t('hero.role', { years: experienceYears })}
          </motion.div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-[var(--text-primary)] leading-[1.05] mb-8 md:mb-10 tracking-tight">
            <Reveal text={t('hero.title_1')} />
            <Reveal text={t('hero.title_2_italic')} className="text-sage italic font-light" delay={0.4} />
          </h1>

          <p className="text-[var(--text-secondary)] text-base sm:text-lg md:text-xl max-w-lg mb-8 md:mb-10 leading-relaxed font-light">
            <Mirror text={t('hero.description')} delay={0.8} />
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-12 w-full sm:w-auto"
          >
            <Link
              to={`/${currentLang}/${paths.contacts}`}
              onClick={handleConsultationClick}
              className="bg-sage hover:bg-sage-bright text-white font-bold px-8 py-4 md:px-10 md:py-5 rounded-full transition-all group flex items-center justify-center gap-3 shadow-xl shadow-sage/20 active:scale-95 text-sm md:text-base w-full sm:w-auto"
            >
              {t('hero.cta_free')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-row gap-4 sm:contents">
              <a
                href="https://t.me/Bohdashkina"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none border border-[var(--card-border)] hover:border-sage/50 text-[var(--text-primary)] px-5 py-4 md:px-10 md:py-5 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base"
              >
                Telegram
                <MessageSquare size={18} />
              </a>
              <a
                href="https://wa.me/380959098980"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none border border-[var(--card-border)] hover:border-sage/50 text-[var(--text-primary)] px-5 py-4 md:px-10 md:py-5 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base"
              >
                WhatsApp
                <MessageCircle size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center lg:justify-between gap-x-12 gap-y-8 py-10 border-t border-sage/10 w-full"
          >
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="font-serif text-3xl sm:text-4xl text-sage pb-1">{t('hero.stats.practice_val', { years: experienceYears })}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">{t('hero.stats.practice')}</div>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="font-serif text-3xl sm:text-4xl text-sage pb-1">{t('hero.stats.won_val')}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">{t('hero.stats.won')}</div>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="font-serif text-3xl sm:text-4xl text-sage pb-1">{t('hero.stats.response_val')}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] font-bold">{t('hero.stats.response')}</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:block"
        >
        </motion.div>
      </div>

      {/* Scroll Hint */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 opacity-30"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-sage">{t('hero.scroll')}</span>
        <div className="w-px h-12 bg-gradient-to-b from-sage to-transparent" />
      </motion.div>
    </section>
  );
}

const Mirror = Reveal; // alias for consistency in replacement
