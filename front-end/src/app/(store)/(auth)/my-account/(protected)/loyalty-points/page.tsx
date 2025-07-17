import React from 'react';
import { getLoyaltyPointsRedemption } from '@/lib/server.actions';
import LoyaltyPoints from './_components/LoyaltyPoints';
import UiError from '@/components/ui/UiError';
import { ServerActionStatus } from '@/lib/config/app.config';

const LoyaltyPointsPage = async () => {
  const response = await getLoyaltyPointsRedemption();

  if (response.status === ServerActionStatus.ERROR) {
    return <div className="flex flex-col items-center justify-center h-full bg-skin-base p-5 rounded-14 shadow-md">
      <p className="text-content-2 md:text-content-1 text-skin-neutral-400">Oops! Loyalty program not available at the moment. Please check back later.</p>
    </div>
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