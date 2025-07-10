import React from 'react';
import { getLoyaltyPointsRedemption } from '@/lib/server.actions';
import LoyaltyPoints from './_components/LoyaltyPoints';
import UiError from '@/components/ui/UiError';
import { ServerActionStatus } from '@/lib/config/app.config';

const LoyaltyPointsPage = async () => {
  const response = await getLoyaltyPointsRedemption();

  if (response.status === ServerActionStatus.ERROR) {
    return <UiError error="Error" description={response.message || "Could not load loyalty points information."} />
  }

  const loyaltyPointsData = response.data;

  return (
    <div className="space-y-6">
      <h2 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">Loyalty Points</h2>
      <LoyaltyPoints data={loyaltyPointsData} />
    </div>
  );
};

export default LoyaltyPointsPage; 