import axios, { AxiosResponse } from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Profile
} from '@/utils/types';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Store Interface
interface AuthStore {
  user: User | null;
  profile: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
}

// Auth Store Implementation
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });

          const response: AxiosResponse<AuthResponse> = await api.post(
            API_ENDPOINTS.LOGIN,
            credentials
          );

          const { access, refresh, user } = response.data;

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          // Fetch user profile
          await get().fetchProfile();

        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.message ||
            error.response?.data?.detail ||
            'Login failed'
          );
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true });

          await api.post(API_ENDPOINTS.REGISTER, userData);

          // Auto-login after registration
          await get().login({
            email: userData.email,
            password: userData.password,
          });
        } catch (error: any) {
          set({ isLoading: false });

          // Extract DRF validation errors
          const data = error.response?.data;
          if (data && typeof data === 'object') {
            // Combine all field messages into one string
            const messages = Object.entries(data)
              .map(([field, errs]) => `${field}: ${(errs as string[]).join(' ')}`)
              .join('\n');
            throw new Error(messages);
          }

          // Fallback
          throw new Error(
            error.response?.data?.message ||
            error.response?.data?.detail ||
            'Registration failed'
          );
        }
      },

      logout: () => {
        // Call logout endpoint (optional, for server-side cleanup)
        if (get().accessToken) {
          api.post(API_ENDPOINTS.LOGOUT).catch(() => {
            // Ignore errors on logout
          });
        }

        get().clearAuth();
      },

      refreshAccessToken: async (): Promise<boolean> => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            get().clearAuth();
            return false;
          }

          const response = await api.post(API_ENDPOINTS.REFRESH, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          set({ accessToken: access });
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          return true;
        } catch (error) {
          get().clearAuth();
          return false;
        }
      },

      fetchProfile: async () => {
        try {
          const response: AxiosResponse<Profile> = await api.get(API_ENDPOINTS.PROFILE);
          set({ profile: response.data });
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      updateProfile: async (profileData: Partial<Profile>) => {
        try {
          const response: AxiosResponse<Profile> = await api.patch(
            API_ENDPOINTS.PROFILE,
            profileData
          );
          set({ profile: response.data });
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || 'Failed to update profile'
          );
        }
      },

      setTokens: (access: string, refresh: string) => {
        set({ accessToken: access, refreshToken: refresh });
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      },

      clearAuth: () => {
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        delete api.defaults.headers.common['Authorization'];

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Request Interceptor for automatic token attachment
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await useAuthStore.getState().refreshAccessToken();

      if (refreshed) {
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export { api };

// Auth Helper Functions
export const authHelpers = {
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  getTokenPayload: (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  },

  initializeAuth: () => {
    const { accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated && accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Check if token is expired and refresh if needed
      if (authHelpers.isTokenExpired(accessToken) && refreshToken) {
        useAuthStore.getState().refreshAccessToken();
      }
    }
  },
};