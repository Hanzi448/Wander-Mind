import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import CreateTripForm from '@/components/trips/CreateTripForm';

const CreateTripPage: React.FC = () => {
  const router = useRouter();

  return (
    <Layout
      title="Create New Trip - WanderMind"
      description="Plan your perfect trip"
      requireAuth={true}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <CreateTripForm
          onSuccess={(trip) => router.push(`/trips/${trip.id}`)}
          onCancel={() => router.push('/trips')}
        />
      </div>
    </Layout>
  );
};

export default CreateTripPage;