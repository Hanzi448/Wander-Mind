// User & Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  is_agent: boolean;
}

export interface Profile {
  id: number;
  bio?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
}

// Destination Types
export interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;

  best_time_to_visit?: string;
  average_temperature?: number;
  popular_activities?: string[];
  local_currency?: string;
  time_zone?: string;
}

export interface Favorite {
  id: number;
  user: string;
  destination: string;
  created_at: string;
}

// Trip Types
export interface Trip {
  id: number;
  user: number;
  name: string;
  destinations: Destination[];
  destination_ids?: number[];
  start_date: string;
  end_date: string;
  budget?: 'low' | 'medium' | 'luxury';
  style?: 'solo' | 'family' | 'adventure' | 'cultural' | 'romantic';
  days: number;
  itinerary?: any;
  weather_snapshot?: any;
  created_at: string;
}

export interface CreateTripRequest {
  name: string;
  destination_ids: number[];
  start_date: string;
  end_date: string;
  budget?: string;
  style?: string;
  days: number;
}

// Weather Types
export interface Weather {
  temperature: string;
  condition: string;
  humidity: string;
  description?: string;
  icon?: string;
  daily: {temp_avg: string, notes: string, icon: string}[];
}

// Currency Types
export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Component Props Types
export interface DestinationCardProps {
  destination: Destination;
  isFavorite?: boolean;
  onFavoriteToggle?: (destinationId: number) => void;
  onViewDetails?: (destination: Destination) => void;
}

export interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: number) => void;
  onViewDetails?: (trip: Trip) => void;
}

// Form Types
export interface TripFormData {
  name: string;
  destinations: number[];
  startDate: Date;
  endDate: Date;
  budget: string;
  style: string;
  days: number;
}

export interface SearchFilters {
  country?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'country' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Map Types
export interface MapProps {
  destinations: Destination[];
  selectedDestination?: Destination;
  onDestinationSelect?: (destination: Destination) => void;
  height?: string;
  className?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
}