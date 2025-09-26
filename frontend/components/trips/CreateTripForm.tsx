import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import { differenceInDays, addDays } from 'date-fns';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Plus,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Destination, CreateTripRequest, TripFormData } from '@/utils/types';
import { BUDGET_OPTIONS, STYLE_OPTIONS, VALIDATION } from '@/utils/constants';
import { destinationService } from '@/services/destinations';
import { tripService } from '@/services/trips';
import { clsx } from 'clsx';

// Import react-datepicker styles
import 'react-datepicker/dist/react-datepicker.css';

// Validation schema
const createTripSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.TRIP_NAME_MIN_LENGTH, `Trip name must be at least ${VALIDATION.TRIP_NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.TRIP_NAME_MAX_LENGTH, `Trip name cannot exceed ${VALIDATION.TRIP_NAME_MAX_LENGTH} characters`),
  destinations: z
    .array(z.number())
    .min(1, 'Please select at least one destination'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  budget: z.string().optional(),
  style: z.string().optional(),
  days: z
    .number()
    .min(VALIDATION.MIN_TRIP_DAYS, `Trip must be at least ${VALIDATION.MIN_TRIP_DAYS} day`)
    .max(VALIDATION.MAX_TRIP_DAYS, `Trip cannot exceed ${VALIDATION.MAX_TRIP_DAYS} days`),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type CreateTripFormData = z.infer<typeof createTripSchema>;

interface CreateTripFormProps {
  onSuccess?: (trip: any) => void;
  onCancel?: () => void;
  initialData?: Partial<TripFormData>;
  isEditing?: boolean;
  tripId?: number;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
  tripId,
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: initialData?.name || '',
      destinations: initialData?.destinations || [],
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || addDays(new Date(), 7),
      budget: initialData?.budget || '',
      style: initialData?.style || '',
      days: initialData?.days || 7,
    },
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const watchedDestinations = watch('destinations');

  // Auto-calculate days when dates change
  useEffect(() => {
    if (watchedStartDate && watchedEndDate && watchedEndDate > watchedStartDate) {
      const days = differenceInDays(watchedEndDate, watchedStartDate) + 1;
      setValue('days', days);
    }
  }, [watchedStartDate, watchedEndDate, setValue]);

  // Load initial destinations and selected destinations
  useEffect(() => {
    loadDestinations();
    if (initialData?.destinations?.length) {
      loadSelectedDestinations(initialData.destinations);
    }
  }, []);

  const loadDestinations = async (searchTerm = '') => {
    try {
      setIsSearching(true);
      const response = await destinationService.getDestinations({
        searchTerm,
        page_size: 20,
      });
      setDestinations(response.results);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadSelectedDestinations = async (destinationIds: number[]) => {
    try {
      const selected = await Promise.all(
        destinationIds.map(id => destinationService.getDestination(id))
      );
      setSelectedDestinations(selected);
    } catch (error) {
      console.error('Failed to load selected destinations:', error);
    }
  };

  const handleDestinationSearch = async (searchTerm: string) => {
    setDestinationSearch(searchTerm);
    if (searchTerm.length > 2) {
      await loadDestinations(searchTerm);
    } else if (searchTerm.length === 0) {
      await loadDestinations();
    }
  };

  const handleAddDestination = (destination: Destination) => {
    if (!selectedDestinations.find(d => d.id === destination.id)) {
      const newSelected = [...selectedDestinations, destination];
      setSelectedDestinations(newSelected);
      setValue('destinations', newSelected.map(d => d.id));
      setDestinationSearch('');
      setShowDestinationSearch(false);
    }
  };

  const handleRemoveDestination = (destinationId: number) => {
    const newSelected = selectedDestinations.filter(d => d.id !== destinationId);
    setSelectedDestinations(newSelected);
    setValue('destinations', newSelected.map(d => d.id));
  };

  const onSubmit = async (data: CreateTripFormData) => {
    try {
      const tripData: CreateTripRequest = {
        name: data.name,
        destination_ids: data.destinations,
        start_date: data.startDate.toISOString().split('T')[0],
        end_date: data.endDate.toISOString().split('T')[0],
        budget: data.budget || undefined,
        style: data.style || undefined,
        days: data.days,
      };

      let result;
      if (isEditing && tripId) {
        result = await tripService.updateTrip(tripId, tripData);
        toast.success('Trip updated successfully!');
      } else {
        result = await tripService.createTrip(tripData);
        toast.success('Trip created successfully!');
      }

      onSuccess?.(result);
    } catch (error: any) {
      console.error('Trip submission error:', error);
      toast.error(error.message || 'Failed to save trip');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Trip' : 'Create New Trip'}
        </h2>
        <p className="text-gray-600">
          Plan your perfect journey with personalized recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Trip Name */}
        <Input
          {...register('name')}
          label="Trip Name"
          placeholder="e.g., Summer Europe Adventure"
          icon={MapPin}
          error={errors.name?.message}
          fullWidth
        />

        {/* Destinations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destinations *
          </label>
          
          {/* Selected Destinations */}
          {selectedDestinations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{destination.name}, {destination.country}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(destination.id)}
                    className="hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Destination Button */}
          <Button
            type="button"
            variant="outline"
            icon={Plus}
            onClick={() => setShowDestinationSearch(true)}
            className="mb-3"
          >
            Add Destination
          </Button>

          {/* Destination Search */}
          {showDestinationSearch && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={destinationSearch}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-gray-500">Searching...</span>
                  </div>
                ) : destinations.length > 0 ? (
                  destinations
                    .filter(d => !selectedDestinations.find(s => s.id === d.id))
                    .map((destination) => (
                      <button
                        key={destination.id}
                        type="button"
                        onClick={() => handleAddDestination(destination)}
                        className="w-full text-left p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="font-medium text-gray-900">{destination.name}</div>
                        <div className="text-sm text-gray-500">{destination.country}</div>
                      </button>
                    ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No destinations found
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDestinationSearch(false)}
                className="mt-3"
              >
                Done
              </Button>
            </div>
          )}

          {errors.destinations && (
            <p className="text-sm text-red-600 mt-1">{errors.destinations.message}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  minDate={new Date()}
                  dateFormat="MMM d, yyyy"
                  className={clsx(
                    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    errors.startDate && 'border-red-300'
                  )}
                  placeholderText="Select start date"
                />
              )}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  minDate={watchedStartDate || new Date()}
                  dateFormat="MMM d, yyyy"
                  className={clsx(
                    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    errors.endDate && 'border-red-300'
                  )}
                  placeholderText="Select end date"
                />
              )}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Duration Display */}
        {watchedStartDate && watchedEndDate && watchedEndDate > watchedStartDate && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>
              Duration: {differenceInDays(watchedEndDate, watchedStartDate) + 1} days
            </span>
          </div>
        )}

        {/* Budget and Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range
            </label>
            <select
              {...register('budget')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select budget range</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Style
            </label>
            <select
              {...register('style')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select travel style</option>
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={selectedDestinations.length === 0}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Trip' : 'Create Trip')
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTripForm;