import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Search, 
  Filter, 
  MapPin, 
  Grid, 
  List, 
  SlidersHorizontal,
  X,
  Globe,
  Heart,
  Sparkles
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DestinationCard from '@/components/destinations/DestinationCard';
import { DestinationCardSkeleton, LoadingSpinner } from '@/components/ui/Loading';
import { useAuthStore } from '@/services/auth';
import { destinationService, useFavorites } from '@/services/destinations';
import { Destination, SearchFilters } from '@/utils/types';
import { clsx } from 'clsx';

const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    country: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    loadDestinations();
    loadCountries();
    
    // Handle URL search params
    const { search, country } = router.query;
    if (search) {
      setFilters(prev => ({ ...prev, searchTerm: search as string }));
    }
    if (country) {
      setFilters(prev => ({ ...prev, country: country as string }));
    }
  }, [router.query]);

  useEffect(() => {
    applyFilters();
  }, [destinations, filters]);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await destinationService.getDestinations({
        page_size: 50, // Load more destinations for better filtering
      });
      setDestinations(response.results);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const countryList = await destinationService.getCountries();
      setCountries(countryList);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...destinations];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        dest =>
          dest.name.toLowerCase().includes(searchLower) ||
          dest.country.toLowerCase().includes(searchLower) ||
          dest.description.toLowerCase().includes(searchLower)
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(dest => dest.country === filters.country);
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any = a[filters.sortBy as keyof Destination];
        let bValue: any = b[filters.sortBy as keyof Destination];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    setFilteredDestinations(filtered);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    // Update URL without page reload
    const newQuery = { ...router.query };
    if (value) {
      newQuery.search = value;
    } else {
      delete newQuery.search;
    }
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const handleCountryChange = (country: string) => {
    setFilters(prev => ({ ...prev, country }));
    const newQuery = { ...router.query };
    if (country) {
      newQuery.country = country;
    } else {
      delete newQuery.country;
    }
    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const handleSortChange = (sortBy: 'country' | 'name' | 'created_at', sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      country: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    router.replace({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const handleFavoriteToggle = async (destinationId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    try {
      await toggleFavorite(destinationId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const activeFiltersCount = [
    filters.searchTerm,
    filters.country,
  ].filter(Boolean).length;

  return (
    <Layout
      title="Discover Amazing Destinations - WanderMind"
      description="Explore thousands of destinations worldwide with detailed information, weather updates, and personalized recommendations."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Discover Destinations
                </h1>
                <p className="text-gray-600">
                  Explore {destinations.length}+ amazing destinations worldwide
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={clsx(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  icon={SlidersHorizontal}
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <Input
                type="text"
                placeholder="Search destinations by name, country, or description..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={Search}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={clsx(
              'w-80 flex-shrink-0 transition-all duration-300',
              showFilters ? 'block' : 'hidden lg:block'
            )}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Country Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={filters.sortBy === 'name' && filters.sortOrder === 'asc'}
                        onChange={() => handleSortChange('name', 'asc')}
                        className="mr-2"
                      />
                      <span className="text-sm">Name (A-Z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={filters.sortBy === 'name' && filters.sortOrder === 'desc'}
                        onChange={() => handleSortChange('name', 'desc')}
                        className="mr-2"
                      />
                      <span className="text-sm">Name (Z-A)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={filters.sortBy === 'country' && filters.sortOrder === 'asc'}
                        onChange={() => handleSortChange('country', 'asc')}
                        className="mr-2"
                      />
                      <span className="text-sm">Country (A-Z)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={filters.sortBy === 'created_at' && filters.sortOrder === 'desc'}
                        onChange={() => handleSortChange('created_at', 'desc')}
                        className="mr-2"
                      />
                      <span className="text-sm">Recently Added</span>
                    </label>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Heart}
                        onClick={() => router.push('/favorites')}
                        fullWidth
                      >
                        View My Favorites
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Sparkles}
                      onClick={() => router.push('/trips/create')}
                      fullWidth
                    >
                      Plan a Trip
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600">
                    {isLoading ? (
                      <span className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Loading destinations...</span>
                      </span>
                    ) : (
                      <>
                        Showing {filteredDestinations.length} of {destinations.length} destinations
                        {filters.searchTerm && (
                          <span className="ml-1">for "{filters.searchTerm}"</span>
                        )}
                        {filters.country && (
                          <span className="ml-1">in {filters.country}</span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={showFilters ? X : Filter}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.searchTerm && (
                    <div className="flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      <Search className="h-3 w-3" />
                      <span>"{filters.searchTerm}"</span>
                      <button
                        onClick={() => handleSearchChange('')}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.country && (
                    <div className="flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      <Globe className="h-3 w-3" />
                      <span>{filters.country}</span>
                      <button
                        onClick={() => handleCountryChange('')}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Destinations Grid */}
              {isLoading ? (
                <div className={clsx(
                  'grid gap-6',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                )}>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <DestinationCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredDestinations.length > 0 ? (
                <div className={clsx(
                  'grid gap-6',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                )}>
                  {filteredDestinations.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      isFavorite={favorites.some(fav => fav.id === destination.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                      showWeather={true}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No destinations found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DestinationsPage;