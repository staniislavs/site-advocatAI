import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { JsonLd, buildLegalServiceSchema } from './JsonLd';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title: customTitle, 
  description: customDescription, 
  keywords: customKeywords,
  image: customImage,
  article = false
}) => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const [seoData, setSeoData] = useState<any>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      const path = 'settings/seo';
      try {
        const docRef = doc(db, 'settings', 'seo');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeoData(docSnap.data());
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.warn('SEO: Client is offline, using defaults.');
        } else {
          try {
            handleFirestoreError(error, OperationType.GET, path);
          } catch (e) {
            // Silently fail after logging if it was a permission error
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, []);

  const defaultTitle = seoData?.global?.title || "Адвокат Дар'я Богдашкіна | Сімейне право Київ";
  const defaultDescription = seoData?.global?.description || "Професійні послуги адвоката. Розлучення, аліменти, поділ майна.";
  const defaultKeywords = seoData?.global?.keywords || "адвокат, київ, сімейне право, розлучення";
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const title = customTitle || defaultTitle;
  const description = customDescription || defaultDescription;
  const keywords = customKeywords || defaultKeywords;
  const image = customImage || `${siteUrl}/og-image.jpg`; 
  const url = `${siteUrl}${pathname}`;

  return (
    <>
    <Helmet>
      {/* Standard identity */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      <html lang={lang || (i18n.language?.split('-')[0] || 'uk')} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Адвокат Дар'я Богдашкіна" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Alternate languages */}
      <link rel="alternate" href={`${siteUrl}/uk${pathname.replace(/^\/[a-z]{2}/, '')}`} hrefLang="uk" />
      <link rel="alternate" href={`${siteUrl}/en${pathname.replace(/^\/[a-z]{2}/, '')}`} hrefLang="en" />
      <link rel="alternate" href={`${siteUrl}/de${pathname.replace(/^\/[a-z]{2}/, '')}`} hrefLang="de" />
      <link rel="alternate" href={`${siteUrl}/uk${pathname.replace(/^\/[a-z]{2}/, '')}`} hrefLang="x-default" />

      {/* Analytics IDs from Firestore */}
      {seoData?.tracking?.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${seoData.tracking.googleAnalyticsId}`} />
      )}
      {seoData?.tracking?.googleAnalyticsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${seoData.tracking.googleAnalyticsId}');
          `}
        </script>
      )}
    </Helmet>
    <JsonLd data={buildLegalServiceSchema(siteUrl)} />
    </>
  );
};
