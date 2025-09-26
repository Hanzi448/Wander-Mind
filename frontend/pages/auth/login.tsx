import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import Button from '@/components/ui/Button';

const LoginPage: React.FC = () => {
  return (
    <Layout
      title="Sign In - WanderMind"
      description="Sign in to your WanderMind account to access your trips, favorites, and personalized travel recommendations."
      showHeader={false}
      showFooter={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-travel-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <div className="absolute top-4 left-4">
          <Link href="/">
            <Button variant="ghost" icon={ArrowLeft} size="sm">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-travel-500 p-3 rounded-2xl">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">WanderMind</span>
          </Link>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600 space-x-4">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-primary-600 transition-colors">
              Help Center
            </Link>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            © {new Date().getFullYear()} WanderMind. All rights reserved.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;