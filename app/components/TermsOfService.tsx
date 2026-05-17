import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { FileText, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { LanguageCode } from '../lib/utils';

export default function TermsOfService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang as LanguageCode) || 'uk';

  return (
    <div className="pt-32 pb-24 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] hover:text-sage transition-all mb-12"
        >
          <div className="w-8 h-8 rounded-full border border-[var(--card-border)] flex items-center justify-center group-hover:border-sage group-hover:bg-sage/5 transition-all">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
          </div>
          {currentLang === 'en' ? 'Back' : currentLang === 'de' ? 'Zurück' : currentLang === 'ru' ? 'Назад' : 'Назад'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center text-sage">
              <FileText size={24} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--text-primary)]">
              {currentLang === 'en' ? 'Terms of Use' : currentLang === 'de' ? 'Nutzungsbedingungen' : currentLang === 'ru' ? 'Условия использования' : 'Умови використання'}
            </h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[var(--text-secondary)] leading-relaxed">
            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">1. Загальні умови</h2>
              <p>
                Використовуючи цей сайт, ви погоджуєтесь з даними Умовами використання. Якщо ви не згодні з будь-яким із положень цих Умов, будь ласка, припиніть використання сайту.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">2. Опис послуг</h2>
              <p>
                Цей сайт є інформаційним ресурсом Адвоката Дар'ї Богдашкіної. Сайт надає інформацію про юридичні послуги, публікує аналітичні матеріали, статті та відповіді на типові запитання у сфері права. Інформація на сайті не є індивідуальною юридичною консультацією.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">3. Права та обов'язки сторін</h2>
              <p><strong>Користувач має право:</strong> переглядати матеріали сайту, використовувати контактні форми для зв'язку з Адвокатом, поширювати посилання на матеріали сайту за умови дотримання авторських прав.</p>
              <p><strong>Адвокат має право:</strong> у будь-який час змінювати зміст сайту, обмежувати доступ до певних розділів, змінювати ці Умови використання.</p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">4. Відмова від відповідальності</h2>
              <p>
                Адвокат не несе відповідальності за будь-які збитки, що виникли внаслідок використання або неможливості використання інформації, розміщеної на сайті. Використання матеріалів сайту без консультації з професійним юристом здійснюється користувачем на власний ризик. Законодавство часто змінюється, і інформація на сайті може не відображати останніх змін.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">5. Інтелектуальна власність</h2>
              <p>
                Всі матеріали, розміщені на сайті (тексти, фотографії, графічні зображення, логотипи), є об'єктами права інтелектуальної власності та охороняються Законом України «Про авторське право і суміжні права». Копіювання матеріалів дозволяється лише з активним гіперпосиланням на джерело.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">6. Конфіденційність</h2>
              <p>
                Порядок збору та використання персональних даних регулюється Політикою конфіденційності, яка є невід'ємною частиною цих Умов.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">7. Вирішення спорів та застосовне право</h2>
              <p>
                Всі спори, що виникають у зв'язку з використанням цього сайту, вирішуються шляхом переговорів. У разі неможливості вирішення спору шляхом переговорів, він підлягає розгляду в судах України відповідно до чинного законодавства України.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-[var(--card-border)] text-xs text-[var(--text-muted)] italic">
             Остання редакція: {new Date().toLocaleDateString('uk-UA')}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
