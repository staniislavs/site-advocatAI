import React from 'react';
import { Helmet } from 'react-helmet-async';

type SchemaProps = { data: object };

export const JsonLd: React.FC<SchemaProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

const SITE_NAME = "Адвокат Дар'я Богдашкіна";
const SITE_PHONE = "+38 (095) 909 89 80";
const SITE_EMAIL = "bogdawkina1@gmail.com";
const SITE_ADDRESS = "м. Київ, вул. Басейна 23, офіс 25";

export const buildLegalServiceSchema = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  '@id': siteUrl,
  name: SITE_NAME,
  description: 'Професійні послуги адвоката у Києві — спеціаліст з сімейного та цивільного права',
  url: siteUrl,
  telephone: SITE_PHONE,
  email: SITE_EMAIL,
  image: `${siteUrl}/og-image.jpg`,
  logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
  priceRange: '$$',
  areaServed: [
    { '@type': 'Country', name: 'Ukraine' },
    { '@type': 'City', name: 'Київ' },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'вул. Басейна 23, офіс 25',
    addressLocality: 'Київ',
    postalCode: '02000',
    addressCountry: 'UA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '50.4501',
    longitude: '30.5234',
  },
  serviceType: ['Розлучення', 'Аліменти', 'Поділ майна', 'Спадкування', 'Цивільні справи'],
  sameAs: [
    'https://t.me/Bohdashkina',
    'https://wa.me/380959098980',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Legal Consultation',
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    areaServed: 'UA',
    availableLanguage: ['uk', 'en', 'de', 'ru'],
  },
});

export const buildArticleSchema = (article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: { '@type': 'Person', name: article.author || SITE_NAME },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: '/logo.png' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': article.url },
});

export const buildBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export const buildFaqSchema = (
  questions: Array<{ question: string; answer: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
});

export const buildReviewSchema = (
  reviews: Array<{ author: string; rating: number; text: string; date: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: SITE_NAME,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: (
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    ).toFixed(1),
    reviewCount: reviews.length,
  },
  review: reviews.map(r => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
    datePublished: r.date,
  })),
});
