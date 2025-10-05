import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';
import { LoadingPage } from '@/components/ui/Loading';
import { useAuthStore } from '@/services/auth';
import { authHelpers } from '@/services/auth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'WanderMind - Your Intelligent Travel Companion',
  description = 'Plan your perfect trip with AI-powered itineraries, discover amazing destinations, and manage your travel experiences all in one place.',
  requireAuth = false,
  showHeader = true,
  showFooter = true,
  className = '',
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    authHelpers.initializeAuth();
  }, []);

  // Handle protected routes
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  // Show loading page while checking authentication
  if (requireAuth && isLoading) {
    return <LoadingPage message="Checking authentication..." />;
  }

  // Don't render content if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/* Additional Meta Tags */}
        <meta name="author" content="WanderMind" />
        <meta name="keywords" content="travel, trip planning, destinations, itinerary, vacation, tourism" />
        <meta name="robots" content="index, follow" />

        {/* Favicon and Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <Header />}

        <main className={`flex-1 ${className}`}>
          {children}
        </main>

        {showFooter && <Footer />}
      </div>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default Layout;