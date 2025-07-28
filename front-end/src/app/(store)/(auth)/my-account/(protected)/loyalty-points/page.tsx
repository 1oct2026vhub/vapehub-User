import React from 'react';
import { getLoyaltyPointsRedemption } from '@/lib/server.actions';
import LoyaltyPoints from './_components/LoyaltyPoints';
// import UiError from '@/components/ui/UiError';
import { ServerActionStatus } from '@/lib/config/app.config';
import LogoutButton from '../../_components/LogoutButton';

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
        <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4 items-center justify-center">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold" />
        </div>
    </div>
  );
};

export default LoyaltyPointsPage; 