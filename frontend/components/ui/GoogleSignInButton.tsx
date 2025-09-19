import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { googleAuthService } from '@/services/googleAuth';
import { useAuthStore } from '@/services/auth';
import { LoadingSpinner } from './Loading';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  width = 280,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { setTokens, fetchProfile } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initializeGoogle = async () => {
      try {
        await googleAuthService.initializeGoogleSignIn();
        
        if (isMounted) {
          setIsGoogleLoaded(true);
          
          // Render the Google button
          if (buttonRef.current && !disabled) {
            googleAuthService.renderGoogleButton(
              buttonRef.current,
              handleGoogleResponse,
              {
                theme,
                size,
                text,
                width,
                shape: 'rectangular',
              }
            );
          }
        }
      } catch (error: any) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (isMounted) {
          const errorMessage = 'Failed to load Google Sign-In';
          onError?.(errorMessage);
          toast.error(errorMessage);
        }
      }
    };

    initializeGoogle();

    return () => {
      isMounted = false;
    };
  }, [disabled, theme, size, text, width]);

  const handleGoogleResponse = async (response: any) => {
    if (!response.credential) {
      const errorMessage = 'Google Sign-In failed - no credential received';
      onError?.(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      
      // Send credential to your backend
      const authResponse = await googleAuthService.handleGoogleAuth(response.credential);
      
      // Store tokens
      setTokens(authResponse.access, authResponse.refresh);
      
      // Fetch user profile
      await fetchProfile();
      
      toast.success('Successfully signed in with Google!');
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Google authentication error:', error);
      const errorMessage = error.message || 'Google Sign-In failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGoogleLoaded && !disabled) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded-lg py-3 px-4 bg-gray-50"
        style={{ width }}
      >
        <LoadingSpinner size="sm" color="gray" />
        <span className="ml-2 text-sm text-gray-600">Loading Google Sign-In...</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-200 rounded-lg py-3 px-4 bg-gray-100 opacity-50 cursor-not-allowed"
        style={{ width }}
      >
        <svg className="w-5 h-5 mr-2 opacity-50" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm text-gray-400">
          {text === 'signin_with' ? 'Sign in' : 
           text === 'signup_with' ? 'Sign up' : 
           'Continue'} with Google
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={buttonRef} style={{ width }} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;