import React, { useState } from 'react';
import Link from 'next/link';
import { format, differenceInDays, isPast, isFuture, isToday } from 'date-fns';
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  MoreVertical,
  Copy,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Trip } from '@/utils/types';
import { BUDGET_OPTIONS, STYLE_OPTIONS } from '@/utils/constants';
import { tripService } from '@/services/trips';
import { clsx } from 'clsx';

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: number) => void;
  onViewDetails?: (trip: Trip) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete,
  onViewDetails,
  variant = 'default',
  className = '',
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Calculate trip status and duration
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration = differenceInDays(endDate, startDate) + 1;
  const today = new Date();

  const getTripStatus = () => {
    if (isPast(endDate)) return { status: 'completed', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (isFuture(startDate)) return { status: 'upcoming', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { status: 'ongoing', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const tripStatus = getTripStatus();

  // Get budget and style labels
  const budgetLabel = BUDGET_OPTIONS.find(b => b.value === trip.budget)?.label || trip.budget;
  const styleLabel = STYLE_OPTIONS.find(s => s.value === trip.style)?.label || trip.style;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await tripService.deleteTrip(trip.id);
      onDelete?.(trip.id);
      toast.success('Trip deleted successfully');
      setShowDeleteModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete trip');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async () => {
    try {
      setIsCloning(true);
      const clonedTrip = await tripService.cloneTrip(trip.id);
      toast.success('Trip cloned successfully');
      // Optionally refresh the trip list or navigate to the new trip
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone trip');
    } finally {
      setIsCloning(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.name,
        text: `Check out my trip to ${trip.destinations.map(d => d.name).join(', ')}`,
        url: `${window.location.origin}/trips/${trip.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}`);
      toast.success('Trip link copied to clipboard');
    }
  };

  return (
    <>
      <div className={clsx(
        'bg-white rounded-xl shadow-md h-fit w-fit hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100',
        variant === 'compact' ? 'p-4' : 'p-6',
        className
      )}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {trip.name}
              </h3>
              <span className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full capitalize',
                tripStatus.color,
                tripStatus.bg
              )}>
                {tripStatus.status}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {trip.destinations.length > 0
                  ? trip.destinations.slice(0, 2).map(d => d.name).join(', ')
                  : 'No destinations selected'}
                {trip.destinations.length > 2 && ` +${trip.destinations.length - 2} more`}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={MoreVertical}
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {/* Empty children to satisfy ButtonProps */}
              <></>
            </Button>

            {showActionsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onViewDetails?.(trip);
                    setShowActionsMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => {
                    onEdit?.(trip);
                    setShowActionsMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Trip</span>
                </button>

                <button
                  onClick={() => {
                    handleClone();
                    setShowActionsMenu(false);
                  }}
                  disabled={isCloning}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  {isCloning ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>Clone Trip</span>
                </button>

                <button
                  onClick={() => {
                    handleShare();
                    setShowActionsMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Trip</span>
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowActionsMenu(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Trip</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-4">
          {/* Dates and Duration */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{duration} {duration === 1 ? 'day' : 'days'}</span>
            </div>
          </div>

          {/* Budget and Style */}
          <div className="flex items-center space-x-4 text-sm">
            {trip.budget && (
              <div className="flex items-center space-x-1 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>{budgetLabel}</span>
              </div>
            )}
            {trip.style && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{styleLabel}</span>
              </div>
            )}
          </div>

          {/* Destinations */}
          {variant !== 'compact' && (
            <div className="flex flex-wrap gap-2">
              {trip.destinations.slice(0, 3).map((destination) => (
                <span
                  key={destination.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {destination.name}
                </span>
              ))}
              {trip.destinations.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                  +{trip.destinations.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Itinerary Status */}
        {trip.itinerary ? (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">
            <Sparkles className="h-4 w-4" />
            <span>AI Itinerary Generated</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mb-4">
            <Sparkles className="h-4 w-4" />
            <span>No itinerary yet</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/trips/${trip.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            View Details →
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => onEdit?.(trip)}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Trip"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{trip.name}"? This action cannot be undone.
          </p>

          <div className="flex items-center space-x-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Trip'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Click outside to close actions menu */}
      {showActionsMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActionsMenu(false)}
        />
      )}
    </>
  );
};

export default TripCard;