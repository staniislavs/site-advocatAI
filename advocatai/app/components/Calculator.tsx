import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function Calculator() {
  const { t } = useTranslation();
  const [caseType, setCaseType] = useState('alimony');
  const [children, setChildren] = useState(1);
  const [period, setPeriod] = useState(12);
  const [result, setResult] = useState<number | null>(null);

  const calculateAward = () => {
    const baseAmounts: Record<string, number> = {
      alimony: 2500,
      spousal: 3000,
      property: 8750
    };

    const baseAmount = baseAmounts[caseType] || 2500;
    const childMultiplier = Math.min(children, 3) * 0.5 + 0.5;
    const periodFactor = Math.min(period / 12, 3);
    const calculated = Math.round(baseAmount * childMultiplier * (1 + periodFactor * 0.2));
    setResult(calculated);
  };

  const reset = () => {
    setCaseType('alimony');
    setChildren(1);
    setPeriod(12);
    setResult(null);
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Form */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 md:p-8">
            <div className="space-y-6">
              {/* Case Type */}
              <div>
                <label className="block text-[var(--text-primary)] font-serif text-sm mb-3">
                  {t('calculator.form.caseType')}
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] font-sans focus:outline-none focus:border-sage/50 transition-colors"
                >
                  <option value="alimony">{t('calculator.form.types.alimony')}</option>
                  <option value="spousal">{t('calculator.form.types.spousal')}</option>
                  <option value="property">{t('calculator.form.types.property')}</option>
                </select>
              </div>

              {/* Children */}
              <div>
                <label className="block text-[var(--text-primary)] font-serif text-sm mb-3">
                  {t('calculator.form.children')}: {children}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer accent-sage"
                />
              </div>

              {/* Period */}
              <div>
                <label className="block text-[var(--text-primary)] font-serif text-sm mb-3">
                  {t('calculator.form.period')}: {period}
                </label>
                <input
                  type="range"
                  min="1"
                  max="180"
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--card-border)] rounded-lg appearance-none cursor-pointer accent-sage"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={calculateAward}
                  className="flex-1 px-6 py-3 bg-sage text-white font-sans rounded-lg hover:bg-sage/90 transition-colors"
                >
                  {t('calculator.form.calculate')}
                </button>
                <button
                  onClick={reset}
                  className="flex-1 px-6 py-3 bg-[var(--bg-primary)] border border-[var(--card-border)] text-[var(--text-primary)] font-sans rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {t('calculator.form.reset')}
                </button>
              </div>

              <p className="text-[var(--text-muted)] text-xs leading-relaxed border-t border-[var(--card-border)] pt-4">
                {t('calculator.form.info')}
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="bg-sage text-white rounded-2xl p-8 md:p-10 flex flex-col justify-center">
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-[var(--text-secondary)]/80 text-sm uppercase tracking-[0.15em] mb-2">
                  {t('calculator.form.period_label')}
                </p>
                <p className="text-5xl md:text-7xl font-serif font-bold mb-4">
                  {result.toLocaleString()}
                  <span className="text-lg"> ₴</span>
                </p>
                <p className="text-white/90 text-base leading-relaxed">
                  {t('calculator.form.period')}: {period} {t('calculator.form.period').toLowerCase()}
                </p>
              </motion.div>
            ) : (
              <div className="text-center">
                <p className="text-white/80 text-base">
                  {t('calculator.description')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
