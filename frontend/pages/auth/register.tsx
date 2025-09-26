import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import RegisterForm from '@/components/auth/RegisterForm';
import Button from '@/components/ui/Button';

const RegisterPage: React.FC = () => {
  return (
    <Layout
      title="Create Account - WanderMind"
      description="Join WanderMind and start planning your perfect trips with AI-powered itineraries and personalized recommendations."
      showHeader={false}
      showFooter={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-travel-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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

        {/* Register Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Join thousands of happy travelers
            </h3>
            <p className="text-gray-600">
              Start your journey with these amazing features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">AI Itineraries</h4>
              <p className="text-sm text-gray-600">Smart trip planning powered by AI</p>
            </div>
            
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Global Destinations</h4>
              <p className="text-sm text-gray-600">Explore 1000+ amazing places</p>
            </div>
            
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Save Favorites</h4>
              <p className="text-sm text-gray-600">Keep track of dream destinations</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
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

export default RegisterPage;