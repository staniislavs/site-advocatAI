import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Calculator, Info, ArrowRight } from 'lucide-react';
import { formatAmount } from '../lib/utils';

export default function AlimonyCalculator() {
  const { t } = useTranslation();
  const [kids, setKids] = useState(1);
  const [income, setIncome] = useState(35000);
  const [status, setStatus] = useState('always'); // 'always', 'sometimes', 'never'

  const calculation = useMemo(() => {
    let percentage = 0.25;
    if (kids === 2) percentage = 0.33;
    if (kids >= 3) percentage = 0.5;

    let baseResult = income * percentage;
    
    // Status effect on the "probability" or range
    // If always - high confidence. If never - lower base but court might assign fixed sum.
    // For the UI, we'll show result as if income is correct.
    
    const min = Math.round(baseResult * 0.9);
    const max = Math.round(baseResult * 1.15);

    return {
      total: Math.round(baseResult),
      min,
      max
    };
  }, [kids, income, status]);

  return (
    <section id="calculator" className="py-16 md:py-32 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 md:mb-16">
          <div className="eyebrow inline-flex items-center gap-2 text-sage mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
            {t('alimonyCalculator.tag')}
          </div>
          <h2 className="text-display text-ink mb-6">
            {t('alimonyCalculator.title')} <span className="text-sage italic font-light">{t('alimonyCalculator.title_italic')}</span>
          </h2>
          <p className="text-ink-2 max-w-2xl font-light leading-relaxed opacity-80">
            {t('alimonyCalculator.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Inputs */}
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-line space-y-10">
            {/* Kids */}
            <div className="space-y-4">
              <label className="eyebrow text-ink-3 block">
                {t('alimonyCalculator.label_kids')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setKids(num)}
                    className={`py-4 rounded-xl border transition-all duration-300 font-medium ${
                      kids === num 
                        ? 'bg-sage border-sage text-bg shadow-lg shadow-sage/20' 
                        : 'bg-bg border-line text-ink hover:border-sage/40'
                    }`}
                  >
                    {num === 4 ? '4+' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Income */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="eyebrow text-ink-3">
                  {t('alimonyCalculator.label_income')}
                </label>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif text-ink">{formatAmount(income)}</span>
                  <span className="text-sm text-ink-3">₴</span>
                </div>
              </div>
              <input
                type="range"
                min="8000"
                max="240000"
                step="5000"
                value={income}
                onChange={(e) => setIncome(parseInt(e.target.value))}
                className="w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-sage"
              />
              <div className="flex justify-between text-[10px] text-ink-3 font-mono opacity-50 uppercase tracking-widest">
                <span>8 000</span>
                <span>240 000+</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <label className="eyebrow text-ink-3 block">
                {t('alimonyCalculator.label_official')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'always', label: t('alimonyCalculator.official_always') },
                  { id: 'sometimes', label: t('alimonyCalculator.official_sometimes') },
                  { id: 'never', label: t('alimonyCalculator.official_never') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStatus(item.id)}
                    className={`py-4 rounded-xl border transition-all duration-300 text-sm ${
                      status === item.id 
                        ? 'bg-sage border-sage text-bg shadow-lg shadow-sage/20' 
                        : 'bg-bg border-line text-ink hover:border-sage/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-sage/5 rounded-xl border border-sage/10">
              <Info size={16} className="text-sage shrink-0 mt-0.5" />
              <p className="text-[11px] text-ink-2 leading-relaxed opacity-70 italic">
                Калькулятор аліментів має юридичну та математичну базу. Результати є орієнтовними, оскільки кожен суд та кожен адвокат по-різному трактують поняття потреб дитини.
              </p>
            </div>
          </div>

          {/* Right: Results */}
          <div className="relative group lg:sticky lg:top-32">
            <div className="absolute -inset-4 bg-sage/5 rounded-[40px] blur-2xl group-hover:bg-sage/10 transition-colors duration-700" />
            <div className="relative dark-island rounded-[32px] p-6 md:p-14 shadow-2xl border border-white/5 space-y-8 md:space-y-12">
              <div className="space-y-4">
                <span className="eyebrow text-sage-bright tracking-[0.3em]">
                  {t('alimonyCalculator.result_title')}
                </span>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <motion.span 
                    key={calculation.total}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-serif text-bg leading-none"
                  >
                    {formatAmount(calculation.total)}
                  </motion.span>
                  <span className="text-xl md:text-2xl text-sage-bright font-light italic">
                    {t('alimonyCalculator.result_currency')}
                  </span>
                </div>
                <div className="text-sage-bright/80 font-mono text-[11px] uppercase tracking-widest tabular">
                  {t('alimonyCalculator.result_range', { min: formatAmount(calculation.min), max: formatAmount(calculation.max) })}
                </div>
              </div>

              <div className="h-px bg-white/10 w-full" />

              <p className="text-sm md:text-base font-light text-bg/90 leading-relaxed max-w-sm">
                {t('alimonyCalculator.result_note')}
              </p>

              <button className="group w-full py-5 px-8 bg-bg text-ink rounded-full eyebrow !text-[11px] flex items-center justify-center gap-3 hover:bg-sage hover:text-bg transition-all duration-500 shadow-xl active:scale-95">
                {t('alimonyCalculator.cta')}
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
