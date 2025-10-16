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
  Clock,
  ArrowRight,
  DollarSign,
  Thermometer,
  TrendingUp
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

      onFavoriteToggle?.(destination.id, !isFavorite);
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

  // Get country flag emoji (simple version)
  const getCountryFlag = (country: string) => {
    const countryFlags: Record<string, string> = {
      'pakistan': '🇵🇰',
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'canada': '🇨🇦',
      'mexico': '🇲🇽',
      'france': '🇫🇷',
      'italy': '🇮🇹',
      'spain': '🇪🇸',
      'germany': '🇩🇪',
      'japan': '🇯🇵',
      'china': '🇨🇳',
      'india': '🇮🇳',
      'australia': '🇦🇺',
      'uk': '🇬🇧',
      'united kingdom': '🇬🇧',
      'brazil': '🇧🇷',
      'argentina': '🇦🇷',
      'turkey': '🇹🇷',
      'egypt': '🇪🇬',
      'thailand': '🇹🇭',
      'uae': '🇦🇪',
      'dubai': '🇦🇪',
      'south korea': '🇰🇷',
      'indonesia': '🇮🇩',
      'malaysia': '🇲🇾',
      'singapore': '🇸🇬',
    };
    return countryFlags[country.toLowerCase()] || '🌍';
  };

  // Get category from description or name
  const getCategory = () => {
    const text = `${destination.name} ${destination.description}`.toLowerCase();
    if (text.includes('beach') || text.includes('coast') || text.includes('island')) return 'Beach';
    if (text.includes('mountain') || text.includes('hill') || text.includes('valley')) return 'Mountain';
    if (text.includes('city') || text.includes('urban') || text.includes('metropolis')) return 'City';
    if (text.includes('desert') || text.includes('sand')) return 'Desert';
    if (text.includes('forest') || text.includes('jungle') || text.includes('nature')) return 'Nature';
    if (text.includes('historical') || text.includes('ancient') || text.includes('heritage')) return 'Historical';
    return null;
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Beach': 'bg-blue-100 text-blue-700 border-blue-200',
      'Mountain': 'bg-green-100 text-green-700 border-green-200',
      'City': 'bg-purple-100 text-purple-700 border-purple-200',
      'Desert': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Nature': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Historical': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  const category = getCategory();

  // Card variants
  const cardVariants = {
    default: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group',
    compact: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group',
    featured: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative',
  };

  const imageVariants = {
    default: 'h-48',
    compact: 'h-32',
    featured: 'h-64',
  };

  return (
    <div className={clsx(cardVariants[variant], className, 'relative flex flex-col')}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoadingFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 z-10 hover:scale-110"
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

        {/* Category Badge */}
        {category && (
          <div className={clsx(
            'absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm border',
            getCategoryColor(category)
          )}>
            {category}
          </div>
        )}

        {/* Featured Badge */}
        {variant === 'featured' && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-primary-500 to-travel-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Featured
          </div>
        )}

        {/* Temperature Badge */}
        {destination.average_temperature && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-md flex items-center space-x-1">
            <Thermometer className="h-3 w-3" />
            <span>{destination.average_temperature}°C</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={clsx('flex-1 flex flex-col', variant === 'compact' ? 'p-3' : 'p-4')}>
        {/* Location & Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <span className="text-lg">{getCountryFlag(destination.country)}</span>
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1 font-medium">{destination.country}</span>
          </div>
          
          {destination.time_zone && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{destination.time_zone.split('/')[1]?.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={clsx(
          'font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-1',
          variant === 'featured' ? 'text-xl' : 'text-lg'
        )}>
          {destination.name}
        </h3>

        {/* Description */}
        {variant !== 'compact' && destination.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
            {destination.description}
          </p>
        )}

        {/* Info Cards */}
        <div className="space-y-2 mb-3">
          {/* Weather */}
          {showWeather && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              {isLoadingWeather ? (
                <LoadingSpinner size="sm" />
              ) : weather?.daily?.[0] ? (
                <>
                  <Image 
                    alt="weather icon" 
                    height={28} 
                    width={28} 
                    src={weather.daily[0].icon || ""} 
                    className="h-7 w-7" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">
                      {weather.daily[0].temp_avg}°
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {weather.daily[0].notes}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-gray-400">
                  <CloudSun className="h-4 w-4" />
                  <span className="text-xs">Weather unavailable</span>
                </div>
              )}
            </div>
          )}

          {/* Best Time to Visit */}
          {destination.best_time_to_visit && (
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-100">
              <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Best Time</p>
                <p className="text-xs text-gray-600 line-clamp-1">{destination.best_time_to_visit}</p>
              </div>
            </div>
          )}

          {/* Popular Activities */}
          {destination.popular_activities && destination.popular_activities.length > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">Activities</p>
                <p className="text-xs text-gray-600 line-clamp-1">
                  {destination.popular_activities.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Currency */}
          {destination.local_currency && (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <DollarSign className="h-3 w-3 text-amber-600" />
              <span className="font-medium">{destination.local_currency}</span>
            </div>
          )}
        </div>

        {/* Stats (for featured variant) */}
        {variant === 'featured' && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 p-2 bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">Popular</span>
            </div>
            {destination.average_temperature && (
              <div className="flex items-center space-x-1">
                <Thermometer className="h-3 w-3 text-orange-500" />
                <span>{destination.average_temperature}°C</span>
              </div>
            )}
            {destination.local_currency && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span>{destination.local_currency}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {variant !== 'compact' && (
          <div className="mt-auto pt-3">
            <Link
              href={`/destinations/${destination.id}`}
              className="block w-full"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="w-full group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Explore Details</span>
                <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default DestinationCard;