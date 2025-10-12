import React, { useState } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import {
  Sparkles,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Camera,
  Utensils,
  Car,
  Plane,
  Hotel,
  RefreshCw,
  Download,
  Share2,
  Edit3,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '@/components/ui/Button';
import { LoadingSpinner, LoadingOverlay } from '@/components/ui/Loading';
import { Trip } from '@/utils/types';
import { tripService } from '@/services/trips';
import { clsx } from 'clsx';

interface ItineraryViewProps {
  trip: Trip;
  onUpdate?: (updatedTrip: Trip) => void;
  onEdit?: () => void;
}

interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
  meals: ItineraryMeal[];
  accommodation?: string;
  transport?: string;
  budget?: number;
  notes?: string;
}

interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost?: number;
  type: 'sightseeing' | 'activity' | 'transport' | 'rest';
  priority: 'high' | 'medium' | 'low';
}

interface ItineraryMeal {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant?: string;
  cost?: number;
  cuisine?: string;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdate,
  onEdit,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  // Parse the itinerary data (assuming it comes from AI in a structured format)
  const parseItinerary = (itineraryData: any): ItineraryDay[] => {
    if (!itineraryData) return [];

    // Handle raw_text format from backend
    if (itineraryData.raw_text) {
      const rawText = itineraryData.raw_text;

      // Extract JSON from markdown code blocks
      let jsonText = rawText;
      if (rawText.includes('```json')) {
        const match = rawText.match(/```json\s*\n?([\s\S]*?)\n?```/);
        if (match) {
          jsonText = match[1];
        }
      }

      // Try to parse the JSON
      try {
        const parsed = JSON.parse(jsonText);
        return convertToDayFormat(parsed);
      } catch (e) {
        console.error('Failed to parse itinerary JSON:', e);
        return [];
      }
    }

    // Handle array format
    if (Array.isArray(itineraryData)) {
      return itineraryData;
    }

    // Handle days object format
    if (typeof itineraryData === 'object' && itineraryData.days) {
      return itineraryData.days;
    }

    // Try to convert object with Day keys to array
    return convertToDayFormat(itineraryData);
  };

  // Helper function to convert {"Day 1": [...], "Day 2": [...]} to array format
  const convertToDayFormat = (data: any): ItineraryDay[] => {
    const days: ItineraryDay[] = [];

    // Sort keys to ensure proper order (Day 1, Day 2, etc.)
    const sortedKeys = Object.keys(data).sort((a, b) => {
      const dayNumA = parseInt(a.match(/\d+/)?.[0] || '0');
      const dayNumB = parseInt(b.match(/\d+/)?.[0] || '0');
      return dayNumA - dayNumB;
    });

    sortedKeys.forEach((key, index) => {
      if (key.toLowerCase().includes('day')) {
        const activities = Array.isArray(data[key]) ? data[key] : [data[key]];

        // Extract day number from the key (e.g., "Day 1" -> 1)
        const dayNumber = parseInt(key.match(/\d+/)?.[0] || String(index + 1));

        days.push({
          day: dayNumber,
          date: format(addDays(parseISO(trip.start_date), dayNumber - 1), 'yyyy-MM-dd'),
          activities: activities.map((activity: string, actIndex: number) => ({
            id: `${dayNumber}-${actIndex}`,
            time: '09:00',
            title: activity.split(':')[0] || 'Activity',
            description: activity,
            location: trip.destinations[0]?.name || 'Location',
            duration: '2-3 hours',
            type: 'sightseeing' as const,
            priority: 'medium' as const,
          })),
          meals: [],
        });
      }
    });

    return days;
  };
  const parseTextItinerary = (text: string): ItineraryDay[] => {
    // Basic text parsing for AI-generated itineraries
    // This would be more sophisticated in a real implementation
    const days = text.split(/Day \d+/i).slice(1);

    return days.map((dayText, index) => ({
      day: index + 1,
      date: format(new Date(trip.start_date).setDate(new Date(trip.start_date).getDate() + index), 'yyyy-MM-dd'),
      activities: [
        {
          id: `${index + 1}-1`,
          time: '09:00',
          title: 'Morning Activity',
          description: dayText.slice(0, 200) + '...',
          location: trip.destinations[0]?.name || 'Location',
          duration: '2-3 hours',
          type: 'sightseeing' as const,
          priority: 'high' as const,
        }
      ],
      meals: [
        { time: '12:00', type: 'lunch' as const, cost: 25 },
        { time: '19:00', type: 'dinner' as const, cost: 40 }
      ],
    }));
  };

  const itineraryDays = parseItinerary(trip.itinerary);

  const handleGenerateItinerary = async () => {
    try {
      setIsGenerating(true);
      const response = await tripService.generateItinerary(trip.id, {
        budget: trip.budget,
        style: trip.style,
        preferences: `Generate a detailed itinerary for ${trip.days} days visiting ${trip.destinations.map(d => d.name).join(', ')}.`,
      });

      if (response.success) {
        const updatedTrip = { ...trip, itinerary: response.itinerary };
        onUpdate?.(updatedTrip);
        toast.success('Itinerary generated successfully!');
      } else {
        toast.error(response.message || 'Failed to generate itinerary');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleActivityExpansion = (activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const getActivityIcon = (type: ItineraryActivity['type']) => {
    switch (type) {
      case 'sightseeing':
        return Camera;
      case 'activity':
        return MapPin;
      case 'transport':
        return Car;
      case 'rest':
        return Hotel;
      default:
        return MapPin;
    }
  };

  const getMealIcon = (type: ItineraryMeal['type']) => {
    return Utensils;
  };

  const handleExport = () => {
    const itineraryText = generateItineraryText();
    const blob = new Blob([itineraryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, '_')}_Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Itinerary exported successfully!');
  };

  const generateItineraryText = () => {
    let text = `${trip.name}\n`;
    text += `${format(parseISO(trip.start_date), 'MMMM d')} - ${format(parseISO(trip.end_date), 'MMMM d, yyyy')}\n`;
    text += `Destinations: ${trip.destinations.map(d => d.name).join(', ')}\n\n`;

    itineraryDays.forEach((day) => {
      text += `DAY ${day.day} - ${format(parseISO(day.date), 'EEEE, MMMM d')}\n`;
      text += `${'='.repeat(40)}\n\n`;

      day.activities.forEach((activity) => {
        text += `${activity.time} - ${activity.title}\n`;
        text += `Location: ${activity.location}\n`;
        text += `Duration: ${activity.duration}\n`;
        text += `${activity.description}\n\n`;
      });

      text += '\n';
    });

    return text;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trip.name} - Itinerary`,
        text: `Check out my travel itinerary for ${trip.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Itinerary link copied to clipboard');
    }
  };

  if (!trip.itinerary) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-primary-100 to-travel-100 p-6 rounded-2xl mb-6">
            <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generate Your AI Itinerary
            </h3>
            <p className="text-gray-600">
              Let our AI create a personalized day-by-day itinerary for your trip to{' '}
              {trip.destinations.map(d => d.name).join(', ')}.
            </p>
          </div>

          <Button
            onClick={handleGenerateItinerary}
            loading={isGenerating}
            variant="primary"
            size="lg"
            icon={Sparkles}
            className="w-full"
          >
            {isGenerating ? 'Generating Itinerary...' : 'Generate AI Itinerary'}
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            This usually takes 10-30 seconds depending on your trip complexity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isGenerating} message="Regenerating itinerary...">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-travel-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">AI Generated Itinerary</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{trip.name}</h2>
              <p className="text-primary-100">
                {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d, yyyy')} • {trip.days} days
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleGenerateItinerary}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Edit3}
                onClick={onEdit}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Edit Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Day by Day Itinerary</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Share2}
                onClick={handleShare}
              >
                Share
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {itineraryDays.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  selectedDay === day.day
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                )}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Content */}
        {itineraryDays.length > 0 && (
          <div className="p-6">
            {(() => {
              const currentDay = itineraryDays.find(d => d.day === selectedDay);
              if (!currentDay) return null;

              return (
                <div>
                  {/* Day Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Day {currentDay.day} - {format(parseISO(currentDay.date), 'EEEE, MMMM d')}
                    </h3>
                    {currentDay.notes && (
                      <p className="text-gray-600">{currentDay.notes}</p>
                    )}
                  </div>

                  {/* Activities Timeline */}
                  <div className="space-y-6">
                    {currentDay.activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      const isExpanded = expandedActivities.has(activity.id);

                      return (
                        <div
                          key={activity.id}
                          className="flex space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className={clsx(
                              'p-2 rounded-lg',
                              activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                            )}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-primary-600">
                                    {activity.time}
                                  </span>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">{activity.duration}</span>
                                </div>

                                <h4 className="font-medium text-gray-900 mb-1">
                                  {activity.title}
                                </h4>

                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{activity.location}</span>
                                </div>

                                <p className={clsx(
                                  'text-gray-600 text-sm',
                                  !isExpanded && 'line-clamp-2'
                                )}>
                                  {activity.description}
                                </p>

                                {activity.description.length > 100 && (
                                  <button
                                    onClick={() => toggleActivityExpansion(activity.id)}
                                    className="text-primary-600 text-sm font-medium mt-1 hover:text-primary-700"
                                  >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </div>

                              {activity.cost && (
                                <div className="text-right">
                                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${activity.cost}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Meals */}
                    {currentDay.meals.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Meals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {currentDay.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3"
                            >
                              <Utensils className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium capitalize">
                                    {meal.type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {meal.time}
                                  </span>
                                </div>
                                {meal.restaurant && (
                                  <p className="text-sm text-gray-600">{meal.restaurant}</p>
                                )}
                                {meal.cost && (
                                  <p className="text-sm text-gray-500">${meal.cost}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accommodation & Transport */}
                    {(currentDay.accommodation || currentDay.transport) && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentDay.accommodation && (
                            <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3">
                              <Hotel className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">Accommodation</p>
                                <p className="text-sm text-gray-600">{currentDay.accommodation}</p>
                              </div>
                            </div>
                          )}

                          {currentDay.transport && (
                            <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg p-3">
                              <Car className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">Transport</p>
                                <p className="text-sm text-gray-600">{currentDay.transport}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Day Budget */}
                    {currentDay.budget && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between bg-primary-50 rounded-lg p-3">
                          <span className="font-medium text-primary-900">Estimated Day Budget</span>
                          <span className="font-semibold text-primary-600">${currentDay.budget}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
};

export default ItineraryView;