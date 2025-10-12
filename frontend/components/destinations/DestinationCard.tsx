import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MapPin,
  Eye,
  Star,
  CloudSun,
  Users,
  Calendar,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Destination, Weather } from '@/utils/types';
import { destinationService } from '@/services/destinations';
import { useAuthStore } from '@/services/auth';
import { clsx } from 'clsx';

interface DestinationCardProps {
  destination: Destination;
  isFavorite?: boolean;
  onFavoriteToggle?: (destinationId: number, isFavorite: boolean) => void;
  onViewDetails?: (destination: Destination) => void;
  showWeather?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  isFavorite = false,
  onFavoriteToggle,
  onViewDetails,
  showWeather = false,
  variant = 'default',
  className = '',
}) => {
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Fetch weather if needed
  React.useEffect(() => {
    if (showWeather && destination.id && !weather) {
      fetchWeather();
    }
  }, [showWeather, destination.id]);

  const fetchWeather = async () => {
    try {
      setIsLoadingWeather(true);
      const weatherData = await destinationService.getDestinationWeather(destination.id);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add favorites');
      return;
    }

    try {
      setIsLoadingFavorite(true);

      if (isFavorite) {
        await destinationService.removeFromFavorites(destination.id);
        toast.success('Removed from favorites');
      } else {
        await destinationService.addToFavorites(destination.id);
        toast.success('Added to favorites');
      }

      // onFavoriteToggle?.(destination.id, !isFavorite);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(destination);
  };

  // Get placeholder image if no image URL
  const imageUrl = destination.image_url ||
    `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&q=80`;

  // Card variants
  const cardVariants = {
    default: 'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group',
    compact: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group',
    featured: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative',
  };

  const imageVariants = {
    default: 'h-48',
    compact: 'h-32',
    featured: 'h-64',
  };

  return (
    <div className={clsx(cardVariants[variant], className, 'relative')}>
      {/* Image Section */}
      <div className={clsx('relative overflow-hidden', imageVariants[variant])}>
        <Image
          src={imageUrl}
          alt={destination.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoadingFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 group-hover:scale-110"
        >
          {isLoadingFavorite ? (
            <LoadingSpinner size="sm" color="gray" />
          ) : (
            <Heart
              className={clsx(
                'h-4 w-4 transition-colors duration-200',
                isFavorite
                  ? 'text-red-500 !fill-red-500'
                  : 'text-gray-400 hover:text-red-500'
              )}
            />
          )}
        </button>

        {/* Featured Badge */}
        {variant === 'featured' && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-primary-500 to-travel-500 text-white text-xs font-medium rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={clsx('p-4 pb-10 relative h-full', variant === 'compact' ? 'p-3' : 'p-4')}>
        {/* Location */}
        <div className="flex items-center space-x-1 text-gray-500 text-sm mb-2">
          <MapPin className="h-3 w-3" />
          <span>{destination.country}</span>
        </div>

        {/* Title */}
        <h3 className={clsx(
          'font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200',
          variant === 'featured' ? 'text-xl' : 'text-lg'
        )}>
          {destination.name}
        </h3>

        {/* Description */}
        {variant !== 'compact' && destination.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {destination.description}
          </p>
        )}

        {/* Weather */}
        {showWeather && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Image alt='weathericon' height={32} width={32} src={weather?.daily[0].icon || ""} className="h-8 w-8" />
            {isLoadingWeather ? (
              <span>Loading weather...</span>
            ) : weather ? (
              <span>{weather?.daily[0].temp_avg}, {weather?.daily[0].notes}</span>
            ) : (
              <span>Weather unavailable</span>
            )}
          </div>
        )}

        {/* Stats (for featured variant) */}
        {variant === 'featured' && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>4.8</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>1.2k visitors</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Year-round</span>
            </div>
          </div>
        )}

      </div>
        {/* Actions */}
        {variant !== 'compact' && (
          <Link
            href={`/destinations/${destination.id}`}
            className="h-fit w-fit absolute !bottom-4 left-4">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={handleViewDetails}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            >
              Explore
            </Button>
          </Link>
        )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div >
  );
};

export default DestinationCard;