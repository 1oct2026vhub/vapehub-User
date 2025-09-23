import React from 'react';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import TrustPilotRatingCard from './TrustPilotRatingCard';
import { getTrustpilotReviews } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

const TrustPilotRating = async () => {
  const response = await getTrustpilotReviews();

  if (response.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load Trustpilot rating' />;
  }

  const data = response.data;
  if (!data) {
    return <EmptyPlaceholder title='Uh, oh!' description='No Trustpilot rating available' />;
  }

  return (
    <TrustPilotRatingCard
      title="Trustpilot has rated Vapehub as Excellent!"
      filledStars={5}
      trustpilotData={data}
    />
  );
};

export default TrustPilotRating;


