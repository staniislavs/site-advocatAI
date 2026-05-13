import { useEffect, useState, useMemo, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router';
import { LOCALIZED_PATHS, LanguageCode } from './lib/utils';

// Public UI components
import Hero from './components/Hero';
import Cases from './components/Cases';
import Situation from './components/Situation';
import Services from './components/Services';
import About from './components/About';
import Process from './components/Process';
import Calculator from './components/Calculator';
import Pricing from './components/Pricing';
import ConsultationCTA from './components/ConsultationCTA';
import Blog from './components/Blog';
import FAQ from './components/FAQ';
import Contacts from './components/Contacts';
import { Reviews } from './components/Reviews';
import ServiceDetail from './components/ServiceDetail';
import ServicesListPage from './components/ServicesListPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

export const HomePage = () => (
  <main>
    <Hero />
    <Cases />
    <Situation />
    <Services />
    <About />
    <Process />
    <Calculator />
    <Pricing />
    <ConsultationCTA />
    <Contacts />
    <Reviews />
    <FAQ />
  </main>
);

export const BlogPage = () => (
  <main className="pt-20 lg:pt-24">
    <Blog />
  </main>
);

export const LocalizedDispatcher = () => {
  const { lang, page, category, slug, id } = useParams<{ 
    lang: string; 
    page: string; 
    category?: string; 
    slug?: string;
    id?: string;
  }>();
  const { i18n } = useTranslation();
  
  const currentLang = (lang as LanguageCode) || (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
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

export const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
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
    }
    // Note: automatic redirect for missing lang is handled by the index route redirect now
  }, [lang, i18n]);

  return <>{children}</>;
};

export const SectionScroller = () => {
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
