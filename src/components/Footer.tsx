import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

export default function Footer() {
  const { t, i18n } = useTranslation();
  
  const currentLang = (i18n.language.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  const navItems = [
    { name: t('navbar.links.services'), href: `/${currentLang}/${paths.services}` },
    { name: t('navbar.links.about'), href: `/${currentLang}/${paths.about}` },
    { name: t('navbar.links.blog'), href: `/${currentLang}/${paths.blog}` },
    { name: t('navbar.links.contacts'), href: `/${currentLang}/${paths.contacts}` },
    { name: t('navbar.links.faq'), href: `/${currentLang}/${paths.faq}` },
  ];

  return (
    <footer className="bg-[var(--bg-primary)] py-16 border-t border-[var(--card-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="font-serif text-xl border-l-2 border-gold/30 pl-3 text-[var(--text-primary)]">
              {t('navbar.name')}
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-gold font-light pl-3 mt-1 opacity-70">
              {t('navbar.role')}
            </div>
            <p className="mt-8 text-[var(--text-muted)] text-xs leading-relaxed max-w-[200px]">
              {t('footer.desc')}
            </p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6">{t('footer.nav_tag')}</div>
            <ul className="space-y-4">
              {navItems.map(item => (
                <li key={item.name}>
                  <Link to={item.href} className="text-[var(--text-secondary)] hover:text-gold text-xs transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6">{t('footer.loc_tag')}</div>
             <ul className="space-y-4">
               <li className="text-[var(--text-secondary)] text-xs leading-relaxed">
                 <strong className="text-[var(--text-primary)] block mb-1">{t('footer.kyiv')}</strong>
                 {t('footer.kyiv_addr')}
               </li>
             </ul>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6">{t('footer.legal_tag')}</div>
            <div className="text-[var(--text-muted)] text-[10px] leading-relaxed">
              {t('footer.legal_text')}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--card-border)] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} {t('footer.rights')}</span>
            <Link to="/admin" className="hover:text-gold transition-colors opacity-30 hover:opacity-100 border-l border-[var(--card-border)] pl-4">
              Вхід
            </Link>
          </div>
          <div className="flex gap-6">
             <Link to={`/${currentLang}/${paths.privacy}`} className="hover:text-gold transition-colors">{t('footer.privacy')}</Link>
             <Link to={`/${currentLang}/${paths.terms}`} className="hover:text-gold transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
