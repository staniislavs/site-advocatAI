import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Calculator() {
  const { t } = useTranslation();
  const [caseType, setCaseType] = useState('alimony');
  const [children, setChildren] = useState(1);
  const [period, setPeriod] = useState(12);
  const [result, setResult] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const calculate = (type: string, ch: number, per: number) => {
    const baseAmounts: Record<string, number> = {
      alimony: 2800,
      spousal: 3500,
      property: 9500
    };
    const base = baseAmounts[type] || 2800;
    const childFactor = Math.min(ch, 3) * 0.45 + 0.55;
    const periodFactor = 1 + Math.min(per / 12, 4) * 0.15;
    return Math.round((base * childFactor * periodFactor) / 100) * 100;
  };

  const handleCalculate = () => {
    setResult(calculate(caseType, children, period));
    setHasCalculated(true);
  };

  const reset = () => {
    setCaseType('alimony');
    setChildren(1);
    setPeriod(12);
    setResult(null);
    setHasCalculated(false);
  };

  const periodLabel = (p: number) => {
    if (p === 1) return '1 міс.';
    if (p < 12) return `${p} міс.`;
    const years = Math.floor(p / 12);
    const months = p % 12;
    if (months === 0) return `${years} р.`;
    return `${years} р. ${months} міс.`;
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
            {t('calculator.tag')}
            <span className="w-8 h-[1px] bg-sage" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-[var(--text-primary)] leading-[1.1] max-w-3xl">
            {t('calculator.title')}
            <span className="text-sage italic font-light"> {t('calculator.title_italic')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
            {t('calculator.description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch"
        >
          {/* Form */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8 flex flex-col">
            <div className="space-y-6 flex-1">
              {/* Case Type */}
              <div>
                <label className="block text-[var(--text-primary)] text-sm font-medium mb-3">
                  {t('calculator.form.caseType')}
                </label>
                <select
                  value={caseType}
                  onChange={(e) => { setCaseType(e.target.value); setHasCalculated(false); setResult(null); }}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-sage/60 transition-colors text-sm"
                >
                  <option value="alimony">{t('calculator.form.types.alimony')}</option>
                  <option value="spousal">{t('calculator.form.types.spousal')}</option>
                  <option value="property">{t('calculator.form.types.property')}</option>
                </select>
              </div>

              {/* Children */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[var(--text-primary)] text-sm font-medium">
                    {t('calculator.form.children')}
                  </label>
                  <span className="text-sage font-serif text-xl font-semibold">{children}</span>
                </div>
                <input
                  type="range" min="1" max="5" value={children}
                  onChange={(e) => { setChildren(parseInt(e.target.value)); setHasCalculated(false); setResult(null); }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-sage bg-[var(--card-border)]"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)] font-medium">
                  {[1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                </div>
              </div>

              {/* Period */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[var(--text-primary)] text-sm font-medium">
                    {t('calculator.form.period')}
                  </label>
                  <span className="text-sage font-serif text-xl font-semibold">{periodLabel(period)}</span>
                </div>
                <input
                  type="range" min="1" max="60" value={period}
                  onChange={(e) => { setPeriod(parseInt(e.target.value)); setHasCalculated(false); setResult(null); }}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-sage bg-[var(--card-border)]"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)] font-medium">
                  <span>1 міс.</span>
                  <span>1 р.</span>
                  <span>2 р.</span>
                  <span>3 р.</span>
                  <span>5 р.</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 mt-2 border-t border-[var(--card-border)]">
              <button
                onClick={handleCalculate}
                className="flex-1 px-6 py-3 bg-sage text-white font-medium rounded-xl hover:bg-sage/90 active:scale-[0.98] transition-all text-sm"
              >
                {t('calculator.form.calculate')}
              </button>
              <button
                onClick={reset}
                className="px-5 py-3 border border-[var(--card-border)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-sm"
              >
                {t('calculator.form.reset')}
              </button>
            </div>

            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed mt-4">
              {t('calculator.form.info')}
            </p>
          </div>

          {/* Result Panel */}
          <div className="bg-sage rounded-2xl p-8 md:p-10 flex flex-col justify-center min-h-[320px] relative overflow-hidden">
            {/* Background circle decoration */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

            <AnimatePresence mode="wait">
              {hasCalculated && result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-semibold mb-3">
                    {t('calculator.form.period_label')}
                  </p>
                  <p className="font-serif font-bold text-white leading-none mb-2">
                    <span className="text-5xl md:text-7xl">{result.toLocaleString('uk-UA')}</span>
                    <span className="text-2xl ml-1">₴</span>
                  </p>
                  <p className="text-white/70 text-sm mb-6">
                    на місяць · {periodLabel(period)} · {children} {children === 1 ? 'дитина' : children < 5 ? 'дитини' : 'дітей'}
                  </p>
                  <div className="bg-white/15 rounded-xl px-4 py-3 text-white/80 text-xs leading-relaxed">
                    Діапазон: {Math.round(result * 0.75).toLocaleString('uk-UA')} – {Math.round(result * 1.3).toLocaleString('uk-UA')} ₴/міс.
                    <br />Залежно від доходу платника та рішення суду.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-5">
                    <CalcIcon size={28} className="text-white/70" />
                  </div>
                  <p className="text-white font-serif text-lg mb-2">
                    Оберіть параметри
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                    Вкажіть тип справи, кількість дітей та орієнтовний строк — і отримайте розрахунок
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
