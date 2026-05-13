import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Shield, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { LanguageCode } from '../lib/utils';

export default function PrivacyPolicy() {
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
              <Shield size={24} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-[var(--text-primary)]">
              {currentLang === 'en' ? 'Privacy Policy' : currentLang === 'de' ? 'Datenschutzerklärung' : currentLang === 'ru' ? 'Политика конфиденциальности' : 'Політика конфіденційності'}
            </h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[var(--text-secondary)] leading-relaxed">
            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">1. Загальні положення</h2>
              <p>
                Ця Політика конфіденційності встановлює порядок отримання, зберігання, обробки, використання і розкриття персональних даних користувачів. Персональні дані користувачів отримує Адвокат Дар'я Богдашкіна (далі — Адвокат), якій належить сайт, від користувачів сайту при використанні сайту.
              </p>
              <p>
                Ми з великою повагою ставимося до конфіденційної інформації будь-якої особи, яка відвідує наш сайт, тому ми прагнемо захищати конфіденційність персональних даних, створюючи максимально комфортні умови використання сайту для кожного користувача.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">2. Збір та обробка персональних даних</h2>
              <p>
                Обробка та зберігання наданих персональних даних здійснюється в дата-центрах, де розміщується обладнання, що забезпечує функціонування сервісів сайту. Надані персональні дані обробляються і можуть зберігатися в базі персональних даних або в окремій таблиці бази даних сайту.
              </p>
              <p>
                Ми збираємо лише ті персональні дані, які свідомо і добровільно надані вами як суб'єктом персональних даних в цілях використання сервісів сайту (наприклад, ім'я, номер телефону, адреса електронної пошти), що відповідно до вимог законодавства є згодою суб'єкта персональних даних на обробку своїх персональних даних.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">3. Мета обробки персональних даних</h2>
              <p>
                Ваші персональні дані використовуються в цілях забезпечення надання послуг, обміну інформацією/новинами, відносин у сфері реклами та комунікації відповідно до Законів України, включаючи, але не обмежуючись: «Про захист персональних даних», «Про ратифікацію Конвенції про захист осіб у зв'язку з автоматизованою обробкою персональних даних та Додаткового протоколу до Конвенції про захист осіб у зв'язку з автоматизованою обробкою персональних даних стосовно органів нагляду та транскордонних потоків даних», «Про інформацію», «Про рекламу», «Про телекомунікації».
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">4. Права суб'єкта персональних даних</h2>
              <p>Адвокат доводить до вашої уваги ваші права як суб'єкта персональних даних, що врегульовані Законом України «Про захист персональних даних», а саме:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>знати про джерела збору, місцезнаходження своїх персональних даних, мету їх обробки;</li>
                <li>отримувати інформацію про умови надання доступу до персональних даних;</li>
                <li>на доступ до своїх персональних даних;</li>
                <li>на пред'явлення вмотивованої вимоги власнику персональних даних із запереченням проти обробки своїх персональних даних;</li>
                <li>на захист своїх персональних даних від незаконної обробки та випадкової втрати;</li>
                <li>відкликати згоду на обробку персональних даних.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">5. Захист персональних даних</h2>
              <p>
                Адвокат використовує загальноприйняті стандарти технологічного та операційного захисту інформації та персональних даних від втрати, неправильного використання, зміни або знищення. Однак, незважаючи на всі зусилля, ми не можемо гарантувати абсолютну захищеність від будь-яких загроз, що виникають поза межами нашого регулювання.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">6. Використання файлів cookie</h2>
              <p>
                Cookie — це невеликі текстові файли, які зберігаються в браузері користувача після відвідування сайту. Ми використовуємо cookie для підвищення якості наданих послуг: для ідентифікації користувача, збереження налаштувань користувача, відстеження тенденцій використання сайту.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-[var(--text-primary)] mb-4">7. Зміни до Політики конфіденційності</h2>
              <p>
                Ми залишаємо за собою право публікувати окремі примітки про конфіденційність, а також у будь-який час змінювати та/або доповнювати зміст Політики на власний розсуд. У разі внесення істотних змін ми розмістимо повідомлення на сайті та зазначимо термін набрання чинності цих змін.
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
