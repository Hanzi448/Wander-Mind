import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Thermometer,
  Heart,
  Share2,
  ArrowLeft,
  Cloud,
  Sun,
  Droplets,
  Wind,
  Navigation,
  Sparkles,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import DestinationMap from '@/components/destinations/DestinationMap';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useAuthStore } from '@/services/auth';
import { destinationService, useFavorites } from '@/services/destinations';
import { Destination } from '@/utils/types';
import { clsx } from 'clsx';

export const dynamic = "force-dynamic";

const DestinationDetailPage: React.FC = () => {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();
  const { favorites, toggleFavorite } = useFavorites();

  const isFavorite = favorites?.some(fav => fav.id === destination?.id) || false;

  useEffect(() => {
    if (id) {
      loadDestination();
    }
  }, [id]);

  useEffect(() => {
    if (destination && !weather && !weatherLoading) {
      loadWeather();
    }
  }, [destination?.id]);

  const loadDestination = async () => {
    try {
      setIsLoading(true);
      const data = await destinationService.getDestination(Number(id));
      setDestination(data);
    } catch (error) {
      console.error('Failed to load destination:', error);
      router.push('/destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeather = async () => {
    if (!destination) return;
    
    try {
      setWeatherLoading(true);
      const weatherData = await destinationService.getWeather(destination.id);
      console.log('Weather data received:', weatherData);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to load weather:', error);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (destination) {
      try {
        await toggleFavorite(destination.id);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && destination) {
      try {
        await navigator.share({
          title: destination.name,
          text: destination.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!destination) {
    return (
      <Layout title="Destination Not Found">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Destination not found
            </h1>
            <Link href="/destinations">
              <Button variant="primary">Browse Destinations</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${destination.name} - WanderMind`}
      description={destination.description}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-blue-500 to-purple-600">
          {destination.image_url ? (
            <img
              src={destination.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-24 w-24 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <Link href="/destinations">
              <Button
                variant="secondary"
                icon={ArrowLeft}
                className="bg-white/90 hover:bg-white"
              >
                Back
              </Button>
            </Link>
          </div>

          {/* Actions */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <Button
              variant="secondary"
              icon={Heart}
              onClick={handleFavoriteToggle}
              className={clsx(
                'bg-white/90 hover:bg-white',
                isFavorite && 'text-red-600'
              )}
            >
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="secondary"
              icon={Share2}
              onClick={handleShare}
              className="bg-white/90 hover:bg-white"
            >
              Share
            </Button>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-2 text-white/90 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{destination.country}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {destination.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About {destination.name}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {destination.description}
                </p>
              </div>

              {/* Weather */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Weather Forecast
                </h2>
                
                {weatherLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : weather?.daily?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Today's Weather - Larger Display */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Today</p>
                          <p className="text-4xl font-bold text-gray-900">
                            {weather.daily[0].temp_avg}°C
                          </p>
                          <p className="text-gray-700 mt-2 capitalize">
                            {weather.daily[0].notes}
                          </p>
                        </div>
                        <img 
                          src={weather.daily[0].icon} 
                          alt={weather.daily[0].notes}
                          className="w-20 h-20"
                        />
                      </div>
                    </div>

                    {/* 5-Day Forecast */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        5-Day Forecast
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {weather.daily.map((day: any, index: number) => (
                          <div 
                            key={day.date}
                            className="bg-gray-50 rounded-lg p-3 text-center"
                          >
                            <p className="text-xs text-gray-600 mb-2">
                              {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <img 
                              src={day.icon} 
                              alt={day.notes}
                              className="w-12 h-12 mx-auto"
                            />
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              {day.temp_avg}°C
                            </p>
                            <p className="text-xs text-gray-600 mt-1 capitalize">
                              {day.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Weather information not available
                    </p>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                </div>
                <DestinationMap
                  destinations={[destination]}
                  height="400px"
                  showControls={true}
                  interactive={true}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Info
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">
                        {destination.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Navigation className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Coordinates</p>
                      <p className="text-sm text-gray-600">
                        {destination.latitude?.toFixed(4) || 'N/A'}, {destination.longitude?.toFixed(4) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {destination.best_time_to_visit && (
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Best Time to Visit</p>
                        <p className="text-sm text-gray-600">
                          {destination.best_time_to_visit}
                        </p>
                      </div>
                    </div>
                  )}

                  {destination.average_temperature && (
                    <div className="flex items-start space-x-3">
                      <Thermometer className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Avg. Temperature</p>
                        <p className="text-sm text-gray-600">
                          {destination.average_temperature}°C
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-primary-500 to-travel-500 rounded-xl shadow-sm p-6 text-white">
                <Sparkles className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  Plan Your Trip
                </h3>
                <p className="text-primary-100 text-sm mb-4">
                  Ready to visit {destination.name}? Create a personalized itinerary with AI assistance.
                </p>
                <Link href={`/trips/create?destination=${destination.id}`}>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="bg-white text-primary-600 hover:bg-gray-50"
                  >
                    Plan a Trip
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DestinationDetailPage;