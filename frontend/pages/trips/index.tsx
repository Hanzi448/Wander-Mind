import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { differenceInDays, isFuture, isPast, parseISO } from 'date-fns';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  MapPin,
  Plane,
  Clock,
  Grid,
  List,
  SlidersHorizontal,
  X,
  TrendingUp,
  Users,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TripCard from '@/components/trips/TripCard';
import { TripCardSkeleton, LoadingSpinner } from '@/components/ui/Loading';
import { useTrips, useTripStats } from '@/services/trips';
import { Trip } from '@/utils/types';
import { clsx } from 'clsx';

type TripFilter = 'all' | 'upcoming' | 'current' | 'past';
type SortOption = 'start_date' | 'end_date' | 'created_at' | 'name';

const TripsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TripFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('start_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<any[]>([]);

  const router = useRouter();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();
  const { stats, loading: statsLoading } = useTripStats();

  useEffect(() => {
    applyFilters();
  }, [trips, searchQuery, activeFilter, sortBy, sortOrder]);

  const applyFilters = () => {
    let filtered = [...(trips || [])];

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchLower) ||
        (trip.destinations || []).some(dest => 
          dest.name.toLowerCase().includes(searchLower) ||
          dest.country.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter
    const today = new Date();
    if (activeFilter !== 'all') {
      filtered = filtered.filter(trip => {
        const startDate = parseISO(trip.start_date);
        const endDate = parseISO(trip.end_date);
        
        switch (activeFilter) {
          case 'upcoming':
            return isFuture(startDate);
          case 'current':
            return startDate <= today && endDate >= today;
          case 'past':
            return isPast(endDate);
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Trip];
      let bValue: any = b[sortBy as keyof Trip];

      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortBy.includes('date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredTrips(filtered);
  };

  const handleTripEdit = (trip: Trip) => {
    router.push(`/trips/${trip.id}/edit`);
  };

  const handleTripDelete = async (tripId: number) => {
    try {
      await deleteTrip(tripId);
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const handleTripView = (trip: Trip) => {
    router.push(`/trips/${trip.id}`);
  };

  const getTripCounts = () => {
    const today = new Date();
    const safeTrips = trips || [];
    return {
      all: safeTrips.length,
      upcoming: safeTrips.filter(t => isFuture(parseISO(t.start_date))).length,
      current: safeTrips.filter(t => {
        const start = parseISO(t.start_date);
        const end = parseISO(t.end_date);
        return start <= today && end >= today;
      }).length,
      past: safeTrips.filter(t => isPast(parseISO(t.end_date))).length,
    };
  };

  const tripCounts = getTripCounts();

  const filters = [
    { id: 'all', label: 'All Trips', count: tripCounts.all },
    { id: 'upcoming', label: 'Upcoming', count: tripCounts.upcoming },
    { id: 'current', label: 'Current', count: tripCounts.current },
    { id: 'past', label: 'Past', count: tripCounts.past },
  ];

  const sortOptions = [
    { value: 'start_date', label: 'Start Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'name', label: 'Trip Name' },
  ];

  return (
    <Layout
      title="My Trips - WanderMind"
      description="Manage all your trips, view itineraries, and plan new adventures."
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
                <p className="text-gray-600">
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `${(trips || []).length} trip${(trips || []).length !== 1 ? 's' : ''} planned`
                  )}
                </p>
              </div>
              
              <Link href="/trips/create">
                <Button variant="primary" icon={Plus} size="lg">
                  Plan New Trip
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            {!statsLoading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Trips</p>
                      <p className="text-2xl font-bold">{stats.totalTrips || 0}</p>
                    </div>
                    <Plane className="h-8 w-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Upcoming</p>
                      <p className="text-2xl font-bold">{stats.upcomingTrips || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Destinations</p>
                      <p className="text-2xl font-bold">{stats.totalDestinations || 0}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Completed</p>
                      <p className="text-2xl font-bold">{stats.completedTrips || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Search trips and destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>

              {/* Controls */}
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
                  {(activeFilter !== 'all' || searchQuery) && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </div>
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
                  {(activeFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Trip Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Status</h4>
                  <div className="space-y-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id as TripFilter)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                          activeFilter === filter.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <span>{filter.label}</span>
                        <span className={clsx(
                          'px-2 py-1 text-xs rounded-full',
                          activeFilter === filter.id
                            ? 'bg-primary-200 text-primary-800'
                            : 'bg-gray-200 text-gray-600'
                        )}>
                          {filter.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={clsx(
                        'flex-1 p-2 text-sm rounded-lg border transition-colors',
                        sortOrder === 'asc'
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={clsx(
                        'flex-1 p-2 text-sm rounded-lg border transition-colors',
                        sortOrder === 'desc'
                          ? 'bg-primary-50 border-primary-200 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      Descending
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link href="/trips/create">
                      <Button variant="primary" size="sm" icon={Plus} fullWidth>
                        Create New Trip
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button variant="outline" size="sm" icon={MapPin} fullWidth>
                        Explore Destinations
                      </Button>
                    </Link>
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
                    {loading ? (
                      <span className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Loading trips...</span>
                      </span>
                    ) : (
                      <>
                        Showing {(filteredTrips || []).length} of {(trips || []).length} trips
                        {searchQuery && (
                          <span className="ml-1">for "{searchQuery}"</span>
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

              {/* Trips Grid/List */}
              {loading ? (
                <div className={clsx(
                  'grid gap-6',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                )}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TripCardSkeleton key={index} />
                  ))}
                </div>
              ) : (filteredTrips || []).length > 0 ? (
                <div className={clsx(
                  'grid gap-6',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                )}>
                  {(filteredTrips || []).map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onEdit={handleTripEdit}
                      onDelete={handleTripDelete}
                      onViewDetails={handleTripView}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  {searchQuery || activeFilter !== 'all' ? (
                    <>
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No trips found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripsPage;