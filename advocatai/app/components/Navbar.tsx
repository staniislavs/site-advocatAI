import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Languages, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

interface NavbarProps {
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function Navbar({ theme, toggleTheme }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentLang = (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const isHomePage = location.pathname === `/${currentLang}` || location.pathname === `/${currentLang}/`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceItems = useMemo(() => [
    { name: t('services.items.divorce.name'), id: 'divorce', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.divorce },
    { name: t('services.items.property.name'), id: 'property', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.property },
    { name: t('services.items.alimony.name'), id: 'alimony', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.alimony },
    { name: t('services.items.children.name'), id: 'children', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.children },
    { name: t('services.items.inheritance.name'), id: 'inheritance', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.inheritance },
    { name: t('services.items.domestic_violence.name'), id: 'domestic_violence', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.domestic_violence },
    { name: t('services.items.property_rights.name'), id: 'property_rights', slug: LOCALIZED_PATHS[currentLang].serviceSlugs.property_rights },
  ], [currentLang, t]);

  const navLinks = useMemo(() => {
    const paths = LOCALIZED_PATHS[currentLang];
    return [
      { name: t('navbar.links.services'), href: `/${currentLang}/${paths.services}`, hasDropdown: true },
      { name: t('navbar.links.about'), href: `/${currentLang}/${paths.about}` },
      { name: t('navbar.links.blog'), href: `/${currentLang}/${paths.blog}`, isInternal: true },
      { name: t('navbar.links.contacts'), href: `/${currentLang}/${paths.contacts}` },
      { name: t('navbar.links.faq'), href: `/${currentLang}/${paths.faq}` },
    ];
  }, [currentLang, t]);

  const languages = [
    { code: 'uk', name: 'UA' },
    { code: 'en', name: 'EN' },
    { code: 'de', name: 'DE' },
    { code: 'ru', name: 'RU' },
  ];

  const changeLanguage = (code: string) => {
    if (code === currentLang) {
      setLangMenuOpen(false);
      return;
    }

    // Attempt to translate the current path to the new language
    const oldPaths = LOCALIZED_PATHS[currentLang];
    const newPaths = LOCALIZED_PATHS[code as LanguageCode];
    
    let newPath = `/${code}`;
    
    // Check if current path matches any localized slug
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const currentSectionSlug = decodeURIComponent(pathParts[1]);
      
      // Find which key this section slug belongs to
      const sectionKey = Object.entries(oldPaths).find(([key, slug]) => key !== 'serviceSlugs' && slug === currentSectionSlug)?.[0];
      
      if (sectionKey) {
        const newSectionSlug = (newPaths as any)[sectionKey];
        newPath = `/${code}/${newSectionSlug}`;
        
        // Handle service detail: /uk/послуги/rozluchennya -> /de/leistungen/scheidung
        if (sectionKey === 'services' && pathParts.length === 3) {
          const currentServiceSlug = pathParts[2];
          const serviceId = Object.entries(oldPaths.serviceSlugs).find(([_, s]) => s === currentServiceSlug)?.[0];
          if (serviceId) {
            const newServiceSlug = (newPaths.serviceSlugs as any)[serviceId];
            if (newServiceSlug) {
              newPath += `/${newServiceSlug}`;
            }
          }
        }
      }
    }

    i18n.changeLanguage(code);
    navigate(newPath);
    setLangMenuOpen(false);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const paths = LOCALIZED_PATHS[currentLang];
    const sectionSlugs = [paths.services, paths.about, paths.contacts, paths.faq];
    const pathParts = href.split('/').filter(Boolean);
    const targetSlug = pathParts[1] ? decodeURIComponent(pathParts[1]) : '';

    if (isHomePage && sectionSlugs.includes(targetSlug)) {
      e.preventDefault();
      
      let sectionId = '';
      if (targetSlug === paths.services) sectionId = 'posluhy';
      else if (targetSlug === paths.about) sectionId = 'pro-mene';
      else if (targetSlug === paths.contacts) sectionId = 'kontakty';
      else if (targetSlug === paths.faq) sectionId = 'faq';

      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState({}, '', href);
          setMobileMenuOpen(false);
        }
      }
    } else if (href.startsWith('/#') && isHomePage) {
      e.preventDefault();
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md py-3 shadow-md'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          to={`/${currentLang}`} 
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setMobileMenuOpen(false);
          }}
          className="group"
        >
          <div className={`font-serif text-lg transition-colors border-l-2 border-sage/30 pl-3 text-[var(--text-primary)]`}>
            {t('navbar.name')}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-sage font-light pl-3 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {t('navbar.role')}
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div 
                    key={link.name} 
                    className="relative group/dropdown"
                    onMouseEnter={() => setServicesMenuOpen(true)}
                    onMouseLeave={() => setServicesMenuOpen(false)}
                  >
                    <a 
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors py-2 ${
                        scrolled ? 'text-[var(--text-secondary)] hover:text-sage' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {link.name}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                    </a>
                    <AnimatePresence>
                      {servicesMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-0 mt-0 pt-2 w-64 z-[100]"
                        >
                          <div className="bg-[var(--bg-secondary)] border border-sage/20 rounded-xl shadow-2xl overflow-hidden py-3 backdrop-blur-xl">
                            {serviceItems.map((item) => (
                              <Link
                                key={item.id}
                                to={`/${currentLang}/${LOCALIZED_PATHS[currentLang].services}/${item.slug}`}
                                className="block px-6 py-3 text-xs font-medium text-[var(--text-secondary)] hover:text-sage hover:bg-sage/5 transition-all"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`group relative text-xs font-medium uppercase tracking-wider transition-colors py-2 ${
                      scrolled ? 'text-[var(--text-secondary)] hover:text-sage' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.name}
                    <motion.div 
                      className="absolute -bottom-1 left-0 w-full h-[1px] bg-sage origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                );
            })}
          </div>
          
          <div className="h-4 w-[1px] bg-sage/30" />

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors text-[var(--text-primary)]`}
            >
              <Languages size={14} className="text-sage" />
              {i18n.language?.split('-')[0].toUpperCase()}
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-3 bg-[var(--bg-secondary)] border border-sage/20 rounded-lg overflow-hidden flex flex-col shadow-2xl"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`px-6 py-2.5 text-[10px] font-bold hover:bg-sage/10 transition-colors border-b border-[var(--card-border)] last:border-0 ${
                        i18n.language?.startsWith(l.code) ? 'text-sage' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-[1px] bg-sage/30" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-sage/10 transition-all text-sage flex items-center justify-center`}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>
          
          <Link 
            to={`/${currentLang}/${LOCALIZED_PATHS[currentLang].contacts}`}
            onClick={(e) => handleLinkClick(e, `/${currentLang}/${LOCALIZED_PATHS[currentLang].contacts}`)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
              scrolled
                ? 'bg-sage text-white border-sage hover:bg-sage/90 hover:border-sage/90'
                : 'bg-sage text-white border-sage hover:bg-sage/90'
            }`}
          >
            {t('navbar.consultation')}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-sage"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {/* Mobile Lang Button */}
          <button 
            onClick={() => {
              const nextIdx = (languages.findIndex(l => i18n.language?.startsWith(l.code)) + 1) % languages.length;
              changeLanguage(languages[nextIdx].code);
            }}
            className="text-sage text-[10px] font-bold border border-sage/20 px-2 py-1 rounded"
          >
            {i18n.language?.split('-')[0].toUpperCase()}
          </button>
          <button 
            className="p-2 text-sage"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[var(--bg-secondary)] border-t border-sage/10 px-6 py-8 flex flex-col gap-2 shadow-2xl md:hidden max-h-[85vh] overflow-y-auto"
          >
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="flex flex-col">
                    <button 
                      onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                      className="flex items-center justify-between text-[var(--text-primary)] hover:text-sage transition-colors py-4 border-b border-[var(--card-border)] w-full text-left font-medium"
                    >
                      <span className="text-sm uppercase tracking-wider">{link.name}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${servicesMenuOpen ? 'rotate-180' : ''} text-sage`} />
                    </button>
                    <AnimatePresence>
                      {servicesMenuOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[var(--bg-primary)]/40 rounded-xl mt-2 mb-2"
                        >
                          <div className="flex flex-col py-3 px-5 gap-1">
                            {serviceItems.map((item) => (
                              <Link
                                key={item.id}
                                to={`/${currentLang}/${LOCALIZED_PATHS[currentLang].services}/${item.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[13px] text-[var(--text-secondary)] hover:text-sage py-3 border-b border-white/5 last:border-0"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => {
                    handleLinkClick(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-[var(--text-primary)] hover:text-sage transition-colors py-4 border-b border-[var(--card-border)] text-sm uppercase tracking-wider font-medium"
                >
                  {link.name}
                </Link>
              );
            })}
            <Link 
              to={`/${currentLang}/${LOCALIZED_PATHS[currentLang].contacts}`}
              onClick={(e) => {
                handleLinkClick(e, `/${currentLang}/${LOCALIZED_PATHS[currentLang].contacts}`);
                setMobileMenuOpen(false);
              }}
              className="mt-6 bg-sage hover:bg-sage-light text-navy font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-sage/20 transition-all active:scale-95"
            >
              <span className="text-xs uppercase tracking-widest">{t('navbar.consultation')}</span> 
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
