import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Preloader() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('preloader_shown');
    }
    return true;
  });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('preloader_shown', 'true');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[9999] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            {/* Background decorative glow - adjusted for better contrast on light backgrounds */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute w-80 h-80 bg-gold/5 dark:bg-gold/10 blur-[100px] rounded-full"
            />

            <div className="relative overflow-hidden flex items-center justify-center p-12">
              {/* Animated Monogram */}
              <div className="flex font-serif text-7xl md:text-8xl tracking-tight select-none">
                <motion.span
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 1.4, 
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="text-[var(--text-primary)]"
                >
                  {t('preloader.initials_1')}
                </motion.span>
                <motion.span
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    duration: 1.4, 
                    delay: 0.4,
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="text-gold italic -ml-1 md:-ml-2"
                >
                  {t('preloader.initials_2')}
                </motion.span>
              </div>

              {/* Progress Line - more delicate */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                className="absolute bottom-6 left-0 h-[1.5px] bg-gold/20 dark:bg-gold/30"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              className="mt-2 text-gold/60 text-[10px] uppercase tracking-[0.5em] font-medium"
            >
              {t('preloader.slogan')}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
