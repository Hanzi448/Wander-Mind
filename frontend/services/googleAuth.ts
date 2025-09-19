import { api } from './auth';
import { AuthResponse } from '@/utils/types';
import { API_ENDPOINTS } from '@/utils/constants';

interface GoogleAuthRequest {
  credential: string;
  client_id: string;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

// Google Authentication Service
export const googleAuthService = {
  // Handle Google OAuth callback
  handleGoogleAuth: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.GOOGLE_AUTH, {
      credential,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    return response.data;
  },

  // Initialize Google Sign-In
  initializeGoogleSignIn: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Sign-In only works in browser'));
        return;
      }

      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeGoogle();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google Sign-In'));
        };
        
        document.head.appendChild(script);
      } else {
        initializeGoogle();
      }

      function initializeGoogle() {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: () => {}, // Will be set per component
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          resolve();
        } else {
          reject(new Error('Google Sign-In initialization failed'));
        }
      }
    });
  },

  // Prompt Google One Tap
  promptGoogleOneTap: (callback: (response: any) => void) => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback,
        auto_select: false,
      });
      window.google.accounts.id.prompt();
    }
  },

  // Render Google Sign-In button
  renderGoogleButton: (
    element: HTMLElement,
    callback: (response: any) => void,
    options?: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
    }
  ) => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback,
      });
      
      window.google.accounts.id.renderButton(element, {
        theme: options?.theme || 'outline',
        size: options?.size || 'large',
        text: options?.text || 'continue_with',
        shape: options?.shape || 'rectangular',
        width: options?.width || 280,
      });
    }
  },

  // Parse JWT token to get user info
  parseJWT: (token: string): GoogleUser | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  },
};

// Extend Window interface for Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}