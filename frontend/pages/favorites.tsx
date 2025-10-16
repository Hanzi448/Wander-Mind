import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart, MapPin, Plus, ArrowRight } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import DestinationCard from '@/components/destinations/DestinationCard';
import { DestinationCardSkeleton } from '@/components/ui/Loading';
import { useFavorites } from '@/services/destinations';
import { clsx } from 'clsx';

const FavoritesPage: React.FC = () => {
  const router = useRouter();
  const { favorites, loading, toggleFavorite } = useFavorites();

  const handleFavoriteToggle = async (destinationId: number) => {
    try {
      await toggleFavorite(destinationId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Process favorites to extract destination objects
  const processedFavorites = React.useMemo(() => {
    return (favorites || [])
      .map((item: any) => {
        // If destination is an object, return it
        if (item?.destination?.id) return item.destination;
        // If item itself is a destination object
        if (item?.id && item?.name && typeof item?.destination !== 'string') return item;
        return null;
      })
      .filter((dest: any) => dest?.id && dest?.name);
  }, [favorites]);

  // Get unique countries
  const uniqueCountries = React.useMemo(() => {
    return new Set(processedFavorites.map((f: any) => f.country).filter(Boolean));
  }, [processedFavorites]);

  return (
    <Layout
      title="My Favorites - WanderMind"
      description="Your saved destinations for future trips"
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="h-8 w-8 text-red-600" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    My Favorite Destinations
                  </h1>
                </div>
                <p className="text-gray-600">
                  {loading ? (
                    'Loading...'
                  ) : (
                    `${processedFavorites.length} destination${processedFavorites.length !== 1 ? 's' : ''} saved`
                  )}
                </p>
              </div>

              <Link href="/destinations">
                <Button variant="primary" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Discover More</span>
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            {!loading && processedFavorites.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-gray-700">
                      You've saved destinations from{' '}
                      <span className="font-semibold">
                        {uniqueCountries.size}
                      </span>{' '}
                      {uniqueCountries.size === 1 ? 'country' : 'countries'}
                    </span>
                  </div>
                  <Link href="/trips/create">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <span>Plan a Trip</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <DestinationCardSkeleton key={index} />
              ))}
            </div>
          ) : processedFavorites.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  All Favorites
                </h2>
                <p className="text-sm text-gray-600">
                  Click on any destination to view details or start planning your trip
                </p>
              </div>

              {/* Destination Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedFavorites.map((destination: any) => (
                  <DestinationCard
                    key={destination.id}
                    destination={destination}
                    isFavorite={true}
                    onFavoriteToggle={() => handleFavoriteToggle(destination.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No favorites yet
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Start exploring destinations and save your favorites for quick access and trip planning.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/destinations">
                    <Button variant="primary" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Explore Destinations</span>
                    </Button>
                  </Link>
                  
                  <Link href="/trips/create">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Plan a Trip</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesPage;