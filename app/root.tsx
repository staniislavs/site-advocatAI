/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Links, 
  Meta, 
  Outlet, 
  Scripts, 
  ScrollRestoration,
  useLocation,
  isRouteErrorResponse
} from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
import Preloader from './components/Preloader';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveBackground from './components/InteractiveBackground';
import stylesheet from "./index.css?url";
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Route } from "./+types/root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
       rel: "stylesheet",
       href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
    },
    { rel: "stylesheet", href: stylesheet },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Дар'я Богдашкіна" />
        <meta name="theme-color" content="#2d3f34" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const AdminLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Ensure server-side and client-side initial render use correctly derived language from URL
  useEffect(() => {
    const urlLang = location.pathname.split('/')[1] || 'uk';
    if (i18n.language !== urlLang && (urlLang === 'uk' || urlLang === 'en' || urlLang === 'de' || urlLang === 'ru')) {
      import('./i18n').then(({ ensureLanguage }) =>
        ensureLanguage(urlLang).then(() => i18n.changeLanguage(urlLang))
      );
    }
  }, [location.pathname, i18n]);

  const isAdminPath = location.pathname.startsWith('/admin');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.className = saved;
    } else {
      document.documentElement.className = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  if (isAdminPath) {
    return (
      <Suspense fallback={<AdminLoading />}>
        <Outlet />
      </Suspense>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
        <SEO />
        <SmoothScroll>
            <div className={`relative min-h-screen selection:bg-gold selection:text-navy overflow-x-hidden ${theme}`}>
              <div key="preloader-anchor">
                <Preloader />
              </div>
              
              <div 
                style={{ 
                  opacity: mounted ? 1 : 0, 
                  transition: 'opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  visibility: mounted ? 'visible' : 'hidden'
                }}
              >
                <InteractiveBackground />
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                
                <Outlet />

                <Footer />
              </div>
            </div>
        </SmoothScroll>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

