import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Video, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';

export default function FirstStep() {
  const { t } = useTranslation();

  const options = [
    {
      id: 'office',
      icon: <Building2 className="w-6 h-6" />,
      label: t('firstStep.office.label'),
      sub: t('firstStep.office.sub')
    },
    {
      id: 'online',
      icon: <Video className="w-6 h-6" />,
      label: t('firstStep.online.label'),
      sub: t('firstStep.online.sub')
    },
    {
      id: 'messenger',
      icon: <MessageSquare className="w-6 h-6" />,
      label: t('firstStep.messenger.label'),
      sub: t('firstStep.messenger.sub')
    },
    {
      id: 'call',
      icon: <PhoneCall className="w-6 h-6" />,
      label: t('firstStep.call.label'),
      sub: t('firstStep.call.sub')
    }
  ];

  return (
    <section id="first-step" className="py-16 md:py-32 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="dark-island rounded-[32px] md:rounded-[40px] p-6 md:p-16 lg:p-24 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-bright rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Text Content */}
            <div className="max-w-xl">
               <div className="eyebrow text-sage-bright mb-8 inline-flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-sage-bright" />
                 {t('firstStep.tag')}
               </div>
               
               <h2 className="text-display text-bg mb-8">
                 {t('firstStep.title')} <span className="text-sage-bright italic underline decoration-sage-bright/30 underline-offset-8">{t('firstStep.title_italic')}</span>
               </h2>
               
               <p className="text-bg/80 text-lg md:text-xl font-light leading-relaxed mb-16">
                 {t('firstStep.description')}
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 border-t border-white/10 pt-10">
                 <div>
                   <div className="eyebrow text-bg/40 !text-[8px] md:!text-[9px] mb-2 md:mb-3">{t('firstStep.address_label')}</div>
                   <p className="text-bg/90 text-sm font-light leading-snug">
                     {t('firstStep.address_val')}
                   </p>
                 </div>
                 <div>
                   <div className="eyebrow text-bg/40 !text-[8px] md:!text-[9px] mb-2 md:mb-3">{t('firstStep.schedule_label')}</div>
                   <p className="text-bg/90 text-sm font-light">
                     {t('firstStep.schedule_val')}
                   </p>
                 </div>
               </div>
            </div>

            {/* Right: Options */}
            <div className="space-y-4">
               {options.map((option, idx) => (
                 <motion.button
                   key={option.id}
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1, duration: 0.6 }}
                   className="w-full group flex items-center justify-between p-6 md:p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-500 text-left active:scale-[0.98]"
                 >
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-xl bg-sage-bright/10 flex items-center justify-center text-sage-bright group-hover:scale-110 transition-transform duration-500">
                       {option.icon}
                     </div>
                     <div>
                       <h4 className="text-bg font-serif text-lg mb-1 group-hover:text-sage-bright transition-colors">
                         {option.label}
                       </h4>
                       <p className="text-bg/50 text-xs font-light lowercase">
                         {option.sub}
                       </p>
                     </div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-bg/20 group-hover:bg-sage-bright group-hover:text-bg transition-all duration-500">
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                 </motion.button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
