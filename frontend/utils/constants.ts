// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/api/accounts/register/',
  LOGIN: '/api/accounts/login/',
  GOOGLE_AUTH: '/api/accounts/google/',
  LOGOUT: '/api/accounts/logout/',
  REFRESH: '/api/accounts/refresh/',
  PROFILE: '/api/accounts/me/',
  
  // Destinations
  DESTINATIONS: '/api/destinations/',
  DESTINATION_DETAIL: (id: number) => `/api/destinations/${id}/`,
  DESTINATION_WEATHER: (id: number) => `/api/destinations/${id}/weather/`,
  DESTINATION_FAVORITE: (id: number) => `/api/destinations/${id}/favorite/`,
  MY_FAVORITES: '/api/destinations/my_favorites/',
  
  // Trips
  TRIPS: '/api/trips/',
  TRIP_DETAIL: (id: number) => `/api/trips/${id}/`,
  GENERATE_ITINERARY: (id: number) => `/api/trips/${id}/generate_itinerary/`,
  
  // Currency
  CURRENCY_CONVERT: '/currency/convert/',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wandermind_access_token',
  REFRESH_TOKEN: 'wandermind_refresh_token',
  USER_DATA: 'wandermind_user_data',
  THEME: 'wandermind_theme',
} as const;

// Trip Options
export const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget-Friendly', description: 'Under $1000' },
  { value: 'medium', label: 'Mid-Range', description: '$1000 - $5000' },
  { value: 'luxury', label: 'Luxury', description: '$5000+' },
] as const;

export const STYLE_OPTIONS = [
  { value: 'solo', label: 'Solo Adventure', description: 'Perfect for individual travelers' },
  { value: 'family', label: 'Family Trip', description: 'Kid-friendly activities and accommodations' },
  { value: 'adventure', label: 'Adventure', description: 'Thrilling outdoor experiences' },
  { value: 'cultural', label: 'Cultural', description: 'Museums, history, and local traditions' },
  { value: 'romantic', label: 'Romantic', description: 'Perfect for couples' },
] as const;

// Navigation Items
export const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'Destinations', href: '/destinations', icon: 'MapPin' },
  { label: 'My Trips', href: '/trips', icon: 'Plane', requiresAuth: true },
  { label: 'Favorites', href: '/favorites', icon: 'Heart', requiresAuth: true },
  { label: 'Currency', href: '/currency', icon: 'DollarSign' },
] as const;

// Default Values
export const DEFAULT_VALUES = {
  TRIP_DAYS: 7,
  MAP_CENTER: [48.8566, 2.3522], // Paris coordinates
  MAP_ZOOM: 2,
  ITEMS_PER_PAGE: 12,
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  TRIP_NAME_MIN_LENGTH: 3,
  TRIP_NAME_MAX_LENGTH: 100,
  MAX_TRIP_DAYS: 365,
  MIN_TRIP_DAYS: 1,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  LOGOUT: 'Successfully logged out.',
  REGISTER: 'Account created successfully!',
  TRIP_CREATED: 'Trip created successfully!',
  TRIP_UPDATED: 'Trip updated successfully!',
  TRIP_DELETED: 'Trip deleted successfully.',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites.',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

// Theme Colors
export const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#0ea5e9',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  neutral: '#6b7280',
} as const;

// Common Currency Codes
export const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
] as const;