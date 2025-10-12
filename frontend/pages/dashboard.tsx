import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import {
  Plus,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  Plane,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Edit3,
  Eye,
  Star,
  Globe,
  DollarSign,
  Camera,
  Target,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import TripCard from '@/components/trips/TripCard';
import DestinationCard from '@/components/destinations/DestinationCard';
import DestinationMap from '@/components/destinations/DestinationMap';
import { LoadingSpinner, TripCardSkeleton, DestinationCardSkeleton } from '@/components/ui/Loading';
import { useAuthStore } from '@/services/auth';
import { useTrips, useTripStats } from '@/services/trips';
import { useFavorites } from '@/services/destinations';
import { Trip, Destination } from '@/utils/types';
import { clsx } from 'clsx';

const DashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trips' | 'favorites' | 'map'>('overview');
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { trips, loading: tripsLoading } = useTrips();
  const { stats, loading: statsLoading } = useTripStats();
  const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();

  useEffect(() => {
    if ((trips || []).length > 0) {
      categorizeTrips();
    }
  }, [trips]);

  const categorizeTrips = () => {
    setIsLoadingTrips(true);
    const today = new Date();
    const safeTrips = trips || [];
    
    const upcoming = safeTrips
      .filter(trip => isFuture(new Date(trip.start_date)))
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3);
    
    const recent = safeTrips
      .filter(trip => isPast(new Date(trip.end_date)))
      .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
      .slice(0, 3);
    
    setUpcomingTrips(upcoming);
    setRecentTrips(recent);
    setIsLoadingTrips(false);
  };

  const handleFavoriteToggle = async (destinationId: number) => {
    try {
      await toggleFavorite(destinationId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentTrips = () => {
    const today = new Date();
    const safeTrips = trips || [];
    return safeTrips.filter(trip => 
      new Date(trip.start_date) <= today && new Date(trip.end_date) >= today
    );
  };

  const currentTrips = getCurrentTrips();
  const allDestinations = (favorites || []).concat(
    (trips || []).flatMap(trip => trip.destinations || [])
      .filter((dest, index, self) => 
        index === self.findIndex(d => d.id === dest.id) &&
        !(favorites || []).some(fav => fav.id === dest.id)
      )
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'trips', label: 'My Trips', icon: Plane },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'map', label: 'Map View', icon: MapPin },
  ];

  return (
    <Layout
      title="Dashboard - WanderMind"
      description="Manage your trips, favorites, and travel plans all in one place."
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={user?.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-travel-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {getGreeting()}, {user?.username}!
                  </h1>
                  <p className="text-gray-600">Ready for your next adventure?</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link href="/trips/create">
                  <Button variant="primary" icon={Plus}>
                    Plan New Trip
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" icon={Edit3}>
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Current Trips Alert */}
        {currentTrips.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Plane className="h-6 w-6" />
                  <div>
                    <p className="font-medium">
                      You're currently on {currentTrips.length} trip{currentTrips.length > 1 ? 's' : ''}!
                    </p>
                    <p className="text-green-100 text-sm">
                      {currentTrips.map(trip => trip.name).join(', ')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => router.push(`/trips/${currentTrips[0].id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={clsx(
                      'flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors',
                      selectedTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Trips</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          stats?.totalTrips || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Plane className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          stats?.upcomingTrips || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Destinations</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {statsLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          stats?.totalDestinations || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorites</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {favoritesLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          (favorites || []).length
                        )}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Trips */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Trips</h2>
                  <Link href="/trips">
                    <Button variant="outline" icon={ArrowRight}>
                      View All Trips
                    </Button>
                  </Link>
                </div>

                {isLoadingTrips ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TripCardSkeleton key={index} />
                    ))}
                  </div>
                ) : upcomingTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onEdit={(trip) => router.push(`/trips/${trip.id}/edit`)}
                        onViewDetails={(trip) => router.push(`/trips/${trip.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No upcoming trips
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ready to plan your next adventure?
                    </p>
                    <Link href="/trips/create">
                      <Button variant="primary" icon={Plus}>
                        Plan Your First Trip
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Favorites */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Favorites</h2>
                  <Link href="/favorites">
                    <Button variant="outline" icon={ArrowRight}>
                      View All Favorites
                    </Button>
                  </Link>
                </div>

                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <DestinationCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (favorites || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(favorites || []).slice(0, 3).map((destination) => (
                      <DestinationCard
                        key={destination.id}
                        destination={destination}
                        isFavorite={true}
                        onFavoriteToggle={() => handleFavoriteToggle(destination.id)}
                        showWeather={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No favorite destinations yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start exploring and save destinations you love
                    </p>
                    <Link href="/destinations">
                      <Button variant="primary" icon={MapPin}>
                        Explore Destinations
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-primary-600 to-travel-500 rounded-2xl p-8 text-white">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold mb-2">Ready for your next adventure?</h2>
                  <p className="text-primary-100 mb-6">
                    Let our AI help you plan the perfect trip based on your preferences and travel history.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link href="/trips/create">
                      <Button variant="secondary" size="lg" icon={Sparkles}>
                        Create AI Trip
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        icon={Globe}
                      >
                        Explore Destinations
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'trips' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
                <Link href="/trips/create">
                  <Button variant="primary" icon={Plus}>
                    Create New Trip
                  </Button>
                </Link>
              </div>

              {tripsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TripCardSkeleton key={index} />
                  ))}
                </div>
              ) : (trips || []).length > 0 ? (
                <div className="space-y-8">
                  {/* Upcoming Trips */}
                  {upcomingTrips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upcoming Trips ({upcomingTrips.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTrips.map((trip) => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            onEdit={(trip) => router.push(`/trips/${trip.id}/edit`)}
                            onViewDetails={(trip) => router.push(`/trips/${trip.id}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Trips */}
                  {currentTrips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Current Trips ({currentTrips.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentTrips.map((trip) => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            onEdit={(trip) => router.push(`/trips/${trip.id}/edit`)}
                            onViewDetails={(trip) => router.push(`/trips/${trip.id}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Trips */}
                  {recentTrips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Trips ({recentTrips.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentTrips.map((trip) => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            onEdit={(trip) => router.push(`/trips/${trip.id}/edit`)}
                            onViewDetails={(trip) => router.push(`/trips/${trip.id}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Plane className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No trips yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start planning your dream vacation! Create your first trip and let AI help you build the perfect itinerary.
                  </p>
                  <Link href="/trips/create">
                    <Button variant="primary" size="lg" icon={Plus}>
                      Create Your First Trip
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'favorites' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Favorite Destinations</h2>
                <Link href="/destinations">
                  <Button variant="outline" icon={MapPin}>
                    Explore More
                  </Button>
                </Link>
              </div>

              {favoritesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <DestinationCardSkeleton key={index} />
                  ))}
                </div>
              ) : (favorites || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(favorites || []).map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      isFavorite={true}
                      onFavoriteToggle={() => handleFavoriteToggle(destination.id)}
                      showWeather={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No favorite destinations yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Discover amazing places around the world and save your favorites for quick access and trip planning.
                  </p>
                  <Link href="/destinations">
                    <Button variant="primary" size="lg" icon={MapPin}>
                      Explore Destinations
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'map' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Map View</h2>
                  <p className="text-gray-600">
                    Visualize your favorite destinations and planned trips
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{allDestinations.length} locations</span>
                </div>
              </div>

              {allDestinations.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <DestinationMap
                    destinations={allDestinations}
                    height="600px"
                    showControls={true}
                    interactive={true}
                    onDestinationSelect={(destination) => {
                      router.push(`/destinations/${destination.id}`);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No locations to display
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Add some favorite destinations or create trips to see them on the map.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link href="/destinations">
                      <Button variant="primary" icon={MapPin}>
                        Explore Destinations
                      </Button>
                    </Link>
                    <Link href="/trips/create">
                      <Button variant="outline" icon={Plus}>
                        Create Trip
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;