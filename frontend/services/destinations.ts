import React from 'react';
import { api } from './auth';
import { 
  Destination, 
  Weather, 
  Favorite,
  SearchFilters,
  ApiResponse 
} from '@/utils/types';
import { API_ENDPOINTS } from '@/utils/constants';

export interface DestinationListResponse {
  results: Destination[];
  count: number;
  next?: string;
  previous?: string;
}

export interface DestinationSearchParams extends SearchFilters {
  page?: number;
  page_size?: number;
}

// Destination API Service
export const destinationService = {
  // Get all destinations with optional search/filter
  getDestinations: async (params?: DestinationSearchParams): Promise<DestinationListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.searchTerm) {
      searchParams.append('search', params.searchTerm);
    }
    if (params?.country) {
      searchParams.append('country', params.country);
    }
    if (params?.sortBy) {
      const ordering = params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy;
      searchParams.append('ordering', ordering);
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      searchParams.append('page_size', params.page_size.toString());
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${API_ENDPOINTS.DESTINATIONS}?${queryString}` : API_ENDPOINTS.DESTINATIONS;
    
    const response = await api.get<any>(url);
    
    // Handle both array and paginated responses
    if (Array.isArray(response.data)) {
      return {
        results: response.data,
        count: response.data.length,
      };
    }
    
    return response.data;
  },

  // Get single destination by ID
  getDestination: async (id: number): Promise<Destination> => {
    const response = await api.get<Destination>(API_ENDPOINTS.DESTINATION_DETAIL(id));
    return response.data;
  },

  // Get weather for destination (alias for consistency)
  getWeather: async (id: number): Promise<Weather> => {
    const response = await api.get<Weather>(API_ENDPOINTS.DESTINATION_WEATHER(id));
    return response.data;
  },

  // Get weather for destination (original method name)
  getDestinationWeather: async (id: number): Promise<Weather> => {
    return destinationService.getWeather(id);
  },

  // Add destination to favorites
  addToFavorites: async (destinationId: number): Promise<void> => {
    await api.post(API_ENDPOINTS.DESTINATION_FAVORITE(destinationId));
  },

  // Remove destination from favorites
  removeFromFavorites: async (destinationId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.DESTINATION_FAVORITE(destinationId));
  },

  // Get user's favorite destinations
  getFavorites: async (): Promise<Destination[]> => {
    const response = await api.get<any>(API_ENDPOINTS.MY_FAVORITES);
    
    // Handle both array and paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return response.data.results || [];
  },

  // Check if destination is favorited
  isFavorite: async (destinationId: number): Promise<boolean> => {
    try {
      const favorites = await destinationService.getFavorites();
      return favorites.some(dest => dest.id === destinationId);
    } catch (error) {
      return false;
    }
  },

  // Get countries list (for filtering)
  getCountries: async (): Promise<string[]> => {
    const response = await destinationService.getDestinations({ page_size: 1000 });
    const countries = Array.from(new Set(response.results.map(dest => dest.country)));
    return countries.sort();
  },

  // Search destinations by name or country
  searchDestinations: async (query: string, limit = 10): Promise<Destination[]> => {
    const response = await destinationService.getDestinations({
      searchTerm: query,
      page_size: limit
    });
    return response.results;
  },

  // Get popular destinations (most favorited)
  getPopularDestinations: async (limit = 6): Promise<Destination[]> => {
    const response = await destinationService.getDestinations({
      sortBy: 'created_at',
      sortOrder: 'desc',
      page_size: limit
    });
    return response.results;
  },

  // Get nearby destinations (based on coordinates)
  getNearbyDestinations: async (
    latitude: number, 
    longitude: number, 
    radius = 100
  ): Promise<Destination[]> => {
    // Note: This would require backend support for geospatial queries
    // For now, we'll get all destinations and filter client-side
    const allDestinations = await destinationService.getDestinations({ page_size: 1000 });
    
    return allDestinations.results.filter(dest => {
      if (!dest.latitude || !dest.longitude) return false;
      
      const distance = calculateDistance(
        latitude, longitude, 
        dest.latitude, dest.longitude
      );
      return distance <= radius;
    });
  },
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Custom hooks for destinations
export const useDestinations = () => {
  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDestinations = async (params?: DestinationSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.getDestinations(params);
      setDestinations(response.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch destinations');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    destinations,
    loading,
    error,
    fetchDestinations,
    refetch: () => fetchDestinations(),
  };
};

export const useDestination = (id: number) => {
  const [destination, setDestination] = React.useState<Destination | null>(null);
  const [weather, setWeather] = React.useState<Weather | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [destResponse, weatherResponse] = await Promise.allSettled([
        destinationService.getDestination(id),
        destinationService.getDestinationWeather(id)
      ]);

      if (destResponse.status === 'fulfilled') {
        setDestination(destResponse.value);
      }
      
      if (weatherResponse.status === 'fulfilled') {
        setWeather(weatherResponse.value);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch destination');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id) {
      fetchDestination();
    }
  }, [id]);

  return {
    destination,
    weather,
    loading,
    error,
    refetch: fetchDestination,
  };
};

export const useFavorites = () => {
  const [favorites, setFavorites] = React.useState<Destination[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await destinationService.getFavorites();
      setFavorites(response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (destinationId: number) => {
    try {
      const isFav = favorites.some(dest => dest.id === destinationId);
      
      if (isFav) {
        await destinationService.removeFromFavorites(destinationId);
        setFavorites(prev => prev.filter(dest => dest.id !== destinationId));
      } else {
        await destinationService.addToFavorites(destinationId);
        // Optionally fetch the destination and add to favorites
        const destination = await destinationService.getDestination(destinationId);
        setFavorites(prev => [...prev, destination]);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update favorite');
    }
  };

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    refetch: fetchFavorites,
    isFavorite: (id: number) => favorites.some(dest => dest.id === id),
  };
};