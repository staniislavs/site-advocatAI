/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
import Preloader from './components/Preloader';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Process from './components/Process';
import Blog from './components/Blog';
import FAQ from './components/FAQ';
import Contacts from './components/Contacts';
import Footer from './components/Footer';
import { Reviews } from './components/Reviews';
import InteractiveBackground from './components/InteractiveBackground';
import ServiceDetail from './components/ServiceDetail';
import ServicesListPage from './components/ServicesListPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { LOCALIZED_PATHS, LanguageCode } from './lib/utils';
import { Toaster } from 'react-hot-toast';

// Lazy load admin components for better initial performance
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLeads = lazy(() => import('./admin/pages/AdminLeads').then(m => ({ default: m.AdminLeads })));
const AdminContent = lazy(() => import('./admin/pages/AdminContent').then(m => ({ default: m.AdminContent })));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminCalendar = lazy(() => import('./admin/pages/AdminCalendar').then(m => ({ default: m.AdminCalendar })));
const AdminMedia = lazy(() => import('./admin/pages/AdminMedia').then(m => ({ default: m.AdminMedia })));
const AdminAnalytics = lazy(() => import('./admin/pages/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminEmail = lazy(() => import('./admin/pages/AdminEmail').then(m => ({ default: m.AdminEmail })));
const AdminSEO = lazy(() => import('./admin/pages/AdminSEO').then(m => ({ default: m.AdminSEO })));
const AdminConnections = lazy(() => import('./admin/pages/AdminConnections').then(m => ({ default: m.AdminConnections })));

const AdminLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <main>
    <Hero />
    <Services />
    <About />
    <Process />
    <Contacts />
    <Reviews />
    <FAQ />
  </main>
);

const BlogPage = () => (
  <main className="pt-20 lg:pt-24">
    <Blog />
  </main>
);

const LocalizedDispatcher = () => {
  const { lang, page, category, slug, id } = useParams<{ 
    lang: string; 
    page: string; 
    category?: string; 
    slug?: string;
    id?: string;
  }>();
  const { i18n } = useTranslation();
  
  const currentLang = (lang as LanguageCode) || (i18n.language.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  if (!paths || !page) return <HomePage />;

  const decodedPage = decodeURIComponent(page || '').trim();

  // Blog route check
  if (decodedPage === paths.blog) {
    return <BlogPage />;
  }

  // Service detail or list check
  if (decodedPage === paths.services) {
    if (!category && !slug && !id) {
      return <main className="pt-20 lg:pt-24"><ServicesListPage /></main>;
    }
    return <ServiceDetail />;
  }

  // Privacy Policy check
  if (decodedPage === paths.privacy) {
    return <PrivacyPolicy />;
  }

  // Terms of Use check
  if (decodedPage === paths.terms) {
    return <TermsOfService />;
  }

  // Section scrolling or default home
  return <SectionScroller />;
};

const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const supportedLangs = ['uk', 'en', 'de', 'ru'];
    if (lang && supportedLangs.includes(lang)) {
       if (i18n.language !== lang) {
         i18n.changeLanguage(lang);
       }
    } else if (!lang) {
      // If no language in URL, redirect or set default
      const savedLang = localStorage.getItem('i18nextLng') || 'uk';
      const initialLang = supportedLangs.includes(savedLang) ? savedLang : 'uk';
      navigate(`/${initialLang}${location.pathname}${location.search}${location.hash}`, { replace: true });
    }
  }, [lang, i18n, navigate, location]);

  return <>{children}</>;
};

const SectionScroller = () => {
  const { page, lang } = useParams<{ page: string; lang: string }>();
  
  const isBlog = useMemo(() => {
    if (!page || !lang) return false;
    const langPaths = LOCALIZED_PATHS[lang as LanguageCode];
    const decodedPage = decodeURIComponent(page);
    return langPaths && decodedPage === langPaths.blog;
  }, [page, lang]);

  useEffect(() => {
    if (!page || !lang || isBlog) return;

    const langPaths = LOCALIZED_PATHS[lang as LanguageCode];
    if (!langPaths) return;

    const decodedPage = decodeURIComponent(page).trim();

    // Map localized slug back to section ID
    let sectionId = '';
    if (decodedPage === langPaths.services) sectionId = 'posluhy';
    else if (decodedPage === langPaths.about) sectionId = 'pro-mene';
    else if (decodedPage === langPaths.contacts) sectionId = 'kontakty';
    else if (decodedPage === langPaths.faq) sectionId = 'faq';

    if (sectionId) {
      const scrollWithRetry = (retryCount = 0) => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (retryCount < 5) {
          setTimeout(() => scrollWithRetry(retryCount + 1), 150);
        }
      };

      // Initial scroll with a bit more delay to ensure everything is rendered
      setTimeout(() => scrollWithRetry(), 200);
    }
  }, [page, lang, isBlog]);

  return isBlog ? <BlogPage /> : <HomePage />;
};

export default function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Light theme by default
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.className = saved;
      return;
    }

    // Default to light if no saved theme
    setTheme('light');
    document.documentElement.className = 'light';
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" />
        <SEO />
        
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={
            <Suspense fallback={<AdminLoading />}>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="connections" element={<AdminConnections />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="email" element={<AdminEmail />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<div className="flex flex-col items-center justify-center h-full text-[#141414]/20 italic font-serif text-3xl">Модуль в розробці...</div>} />
          </Route>
          
          <Route path="/admin/login" element={
            <Suspense fallback={<AdminLoading />}>
              <AdminLogin />
            </Suspense>
          } />

          {/* Global Client Routes */}
          <Route path="*" element={
            <SmoothScroll>
              <div className={`relative min-h-screen selection:bg-gold selection:text-navy overflow-x-hidden ${theme}`}>
                <Preloader />
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <InteractiveBackground />
                  <Navbar theme={theme} toggleTheme={toggleTheme} />
                  
                  <Routes>
                    {/* Redirect root to default language */}
                    <Route path="/" element={<Navigate to={`/${i18n.language.split('-')[0]}`} replace />} />
                    
                    <Route path="/:lang" element={<LanguageWrapper><HomePage /></LanguageWrapper>} />
                    
                    {/* All localized routes handled by dispatcher to prevent collisions */}
                    <Route path="/:lang/:page" element={
                       <LanguageWrapper>
                         <LocalizedDispatcher />
                       </LanguageWrapper>
                    } />
                    <Route path="/:lang/:page/:category" element={
                       <LanguageWrapper>
                         <LocalizedDispatcher />
                       </LanguageWrapper>
                    } />
                    <Route path="/:lang/:page/:category/:slug" element={
                       <LanguageWrapper>
                         <LocalizedDispatcher />
                       </LanguageWrapper>
                    } />
                    
                    {/* Catch-all/Legacy Service route if needed, but dispatcher handles :lang/:page/:id too via the routes above if params match */}
                    <Route path="/:lang/:page/:id" element={
                      <LanguageWrapper>
                        <LocalizedDispatcher />
                      </LanguageWrapper>
                    } />
                  </Routes>
        
                  <Footer />
                </motion.div>
              </div>
            </SmoothScroll>
          } />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
