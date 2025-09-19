import React from 'react';
import { api } from './auth';
import { 
  Trip, 
  CreateTripRequest,
  ApiResponse 
} from '@/utils/types';
import { API_ENDPOINTS } from '@/utils/constants';

export interface TripListResponse {
  results: Trip[];
  count: number;
  next?: string;
  previous?: string;
}

export interface TripSearchParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface GenerateItineraryRequest {
  preferences?: string;
  budget?: string;
  style?: string;
}

export interface ItineraryResponse {
  itinerary: any;
  success: boolean;
  message?: string;
}

// Trip API Service
export const tripService = {
  // Get all user trips
  getTrips: async (params?: TripSearchParams): Promise<TripListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.page_size) {
      searchParams.append('page_size', params.page_size.toString());
    }
    if (params?.ordering) {
      searchParams.append('ordering', params.ordering);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${API_ENDPOINTS.TRIPS}?${queryString}` : API_ENDPOINTS.TRIPS;
    
    const response = await api.get<TripListResponse>(url);
    return response.data;
  },

  // Get single trip by ID
  getTrip: async (id: number): Promise<Trip> => {
    const response = await api.get<Trip>(API_ENDPOINTS.TRIP_DETAIL(id));
    return response.data;
  },

  // Create new trip
  createTrip: async (tripData: CreateTripRequest): Promise<Trip> => {
    const response = await api.post<Trip>(API_ENDPOINTS.TRIPS, tripData);
    return response.data;
  },

  // Update existing trip
  updateTrip: async (id: number, tripData: Partial<CreateTripRequest>): Promise<Trip> => {
    const response = await api.patch<Trip>(API_ENDPOINTS.TRIP_DETAIL(id), tripData);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.TRIP_DETAIL(id));
  },

  // Generate AI itinerary for trip
  generateItinerary: async (
    tripId: number, 
    preferences?: GenerateItineraryRequest
  ): Promise<ItineraryResponse> => {
    const response = await api.post<ItineraryResponse>(
      API_ENDPOINTS.GENERATE_ITINERARY(tripId),
      preferences || {}
    );
    return response.data;
  },

  // Get upcoming trips
  getUpcomingTrips: async (limit = 5): Promise<Trip[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await tripService.getTrips({
      ordering: 'start_date',
      page_size: limit
    });
    
    return response.results.filter(trip => trip.start_date >= today);
  },

  // Get past trips
  getPastTrips: async (limit = 10): Promise<Trip[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await tripService.getTrips({
      ordering: '-end_date',
      page_size: limit
    });
    
    return response.results.filter(trip => trip.end_date < today);
  },

  // Get current trips (happening now)
  getCurrentTrips: async (): Promise<Trip[]> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await tripService.getTrips();
    
    return response.results.filter(trip => 
      trip.start_date <= today && trip.end_date >= today
    );
  },

  // Clone/duplicate a trip
  cloneTrip: async (tripId: number, newData?: Partial<CreateTripRequest>): Promise<Trip> => {
    const originalTrip = await tripService.getTrip(tripId);
    
    const clonedTripData: CreateTripRequest = {
      name: `Copy of ${originalTrip.name}`,
      destination_ids: originalTrip.destinations.map(dest => dest.id),
      start_date: originalTrip.start_date,
      end_date: originalTrip.end_date,
      budget: originalTrip.budget,
      style: originalTrip.style,
      days: originalTrip.days,
      ...newData
    };

    return await tripService.createTrip(clonedTripData);
  },

  // Get trip statistics
  getTripStats: async (): Promise<{
    totalTrips: number;
    upcomingTrips: number;
    completedTrips: number;
    totalDestinations: number;
    favoriteDestination?: string;
  }> => {
    const trips = await tripService.getTrips();
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = trips.results.filter(trip => trip.start_date > today);
    const completed = trips.results.filter(trip => trip.end_date < today);
    
    // Count unique destinations
    const allDestinations = trips.results.flatMap(trip => trip.destinations);
    const uniqueDestinations = new Set(allDestinations.map(dest => dest.id));
    
    // Find most visited destination
    const destinationCounts: { [key: string]: number } = {};
    allDestinations.forEach(dest => {
      destinationCounts[dest.name] = (destinationCounts[dest.name] || 0) + 1;
    });
    
    const favoriteDestination = Object.keys(destinationCounts).reduce(
      (a, b) => destinationCounts[a] > destinationCounts[b] ? a : b,
      ''
    );

    return {
      totalTrips: trips.results.length,
      upcomingTrips: upcoming.length,
      completedTrips: completed.length,
      totalDestinations: uniqueDestinations.size,
      favoriteDestination: favoriteDestination || undefined,
    };
  },
};

// Custom hooks for trips
export const useTrips = () => {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTrips = async (params?: TripSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripService.getTrips(params);
      setTrips(response.results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: CreateTripRequest) => {
    try {
      setError(null);
      const newTrip = await tripService.createTrip(tripData);
      setTrips(prev => [newTrip, ...prev]);
      return newTrip;
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
      throw err;
    }
  };

  const updateTrip = async (id: number, tripData: Partial<CreateTripRequest>) => {
    try {
      setError(null);
      const updatedTrip = await tripService.updateTrip(id, tripData);
      setTrips(prev => prev.map(trip => trip.id === id ? updatedTrip : trip));
      return updatedTrip;
    } catch (err: any) {
      setError(err.message || 'Failed to update trip');
      throw err;
    }
  };

  const deleteTrip = async (id: number) => {
    try {
      setError(null);
      await tripService.deleteTrip(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip');
      throw err;
    }
  };

  React.useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    refetch: () => fetchTrips(),
  };
};

export const useTrip = (id: number) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripService.getTrip(id);
      setTrip(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trip');
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async (preferences?: GenerateItineraryRequest) => {
    try {
      setError(null);
      const response = await tripService.generateItinerary(id, preferences);
      
      if (response.success && trip) {
        const updatedTrip = { ...trip, itinerary: response.itinerary };
        setTrip(updatedTrip);
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary');
      throw err;
    }
  };

  React.useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  return {
    trip,
    loading,
    error,
    generateItinerary,
    refetch: fetchTrip,
  };
};

export const useTripStats = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripService.getTripStats();
      setStats(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trip statistics');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};