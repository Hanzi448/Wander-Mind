import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import CreateTripForm from '@/components/trips/CreateTripForm';
import { LoadingSpinner } from '@/components/ui/Loading';
import { tripService } from '@/services/trips';
import { Trip } from '@/utils/types';

const EditTripPage: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    try {
      setIsLoading(true);
      const data = await tripService.getTrip(Number(id));
      setTrip(data);
    } catch (error) {
      console.error('Failed to load trip:', error);
      router.push('/trips');
    } finally {
      setIsLoading(false);
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

  if (!trip) {
    return (
      <Layout title="Trip Not Found">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Trip not found
            </h1>
            <Link href="/trips">
              <Button variant="primary">Back to Trips</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Edit ${trip.name} - WanderMind`}
      description="Edit your trip details"
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/trips/${trip.id}`}>
              <Button variant="outline" icon={ArrowLeft} size="sm">
                Back to Trip
              </Button>
            </Link>
          </div>

          <CreateTripForm
            initialData={{
              name: trip.name,
              destinations: trip.destinations.map(d => d.id),
              startDate: new Date(trip.start_date),
              endDate: new Date(trip.end_date),
              budget: trip.budget,
              style: trip.style,
              days: trip.days,
            }}
            isEditing={true}
            tripId={trip.id}
            onSuccess={(updatedTrip) => {
              router.push(`/trips/${updatedTrip.id}`);
            }}
            onCancel={() => router.push(`/trips/${trip.id}`)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditTripPage;