import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { getExperienceYears } from '../constants';

interface ServiceGridProps {
  services: any[];
  icons: Record<string, any>;
  onSelect: (service: any) => void;
}

export default function ServiceGrid({ services, icons, onSelect }: ServiceGridProps) {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-4 auto-rows-auto md:auto-rows-fr lg:auto-rows-[100px]"
    >
      {services.map((service, idx) => {
        const isFeatured = idx === 0;
        const isTall = idx === 1;
        const isMedium = idx >= 2 && idx <= 4;

        let gridClasses = '';
        if (isFeatured) gridClasses = 'md:col-span-4 lg:col-span-8 lg:row-span-3 min-h-[250px] md:min-h-[300px] border-sage/20 shadow-2xl dark-island';
        else if (isTall) gridClasses = 'md:col-span-2 lg:col-span-4 lg:row-span-3 bg-surface border-line';
        else if (isMedium) gridClasses = 'md:col-span-2 lg:col-span-4 lg:row-span-2 bg-surface border-line';
        else gridClasses = 'md:col-span-2 lg:col-span-6 lg:row-span-2 bg-surface border-line';
        
        return (
          <motion.div
            key={service.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => onSelect(service)}
            className={`group cursor-pointer flex flex-col justify-between p-5 rounded-lg border transition-all duration-500 relative overflow-hidden ${gridClasses}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] translate-x-12 -translate-y-12 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-700 ${isFeatured ? 'bg-bg/10' : 'bg-sage/5'}`} />
            
            <div className="relative z-10 flex flex-col h-full w-full">
              <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-700 relative ${isFeatured ? 'bg-sage text-bg shadow-lg shadow-sage/20' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-bg'}`}>
                <div className={`relative z-10 transition-transform duration-700 group-hover:scale-110 ${isFeatured ? 'scale-110' : 'scale-90'}`}>
                  {icons[service.iconKey]}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className={`font-serif mb-2 leading-tight transition-all duration-300 ${isFeatured ? 'text-2xl md:text-3xl text-bg' : 'text-xl md:text-2xl text-ink group-hover:text-sage'}`}>
                  {service.name}
                </h3>
                <p className={`font-sans leading-relaxed transition-all duration-300 ${isFeatured ? 'text-bg/80 text-description mb-4' : 'text-ink-2 text-description group-hover:text-ink line-clamp-2'}`}>
                  {service.desc}
                </p>
              </div>

              <div className={`flex items-center justify-between pt-6 mt-auto border-t ${isFeatured ? 'border-white/10' : 'border-line'}`}>
                <span className={`eyebrow !text-[10px] transition-colors ${isFeatured ? 'text-sage-bright' : 'text-ink-4 group-hover:text-sage'}`}>
                  {t('services.more')}
                </span>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isFeatured ? 'border-white/20 bg-white/5 group-hover:bg-sage-bright group-hover:border-sage-bright' : 'border-line group-hover:border-sage group-hover:bg-sage/5'}`}>
                  <ArrowUpRight size={14} className={isFeatured ? 'text-sage-bright group-hover:text-bg' : 'text-ink-4 group-hover:text-sage'} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
