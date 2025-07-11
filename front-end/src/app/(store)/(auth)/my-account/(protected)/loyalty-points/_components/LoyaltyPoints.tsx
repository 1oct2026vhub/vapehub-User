import React from 'react';
import { LoyaltyPointsRedemptionResponse } from '@/lib/config/loyalty-points.config';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';

interface LoyaltyPointsProps {
  data: LoyaltyPointsRedemptionResponse;
}

const LoyaltyPoints: React.FC<LoyaltyPointsProps> = ({ data }) => {
  console.log("loyalty points data", data);
  const redemptionAmount = data.redemption_type === 'percentage'
    ? `${data.redemption_amount}%`
    : `${DEFAULT_CURRENCY_SYMBOL}${Number(data.redemption_amount).toFixed(2)}`;
    
  return (
    <div className="bg-skin-base p-5 rounded-14 shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-skin-primary-void">Your Loyalty Points</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Your Points</p>
          <p className="text-title-3 font-bold text-skin-primary-void">{data.user_points}</p>
        </div>
        {/* <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Total Value</p>
          <p className="text-title-3 font-bold text-skin-primary-void">£{Number(data.total_points_value).toFixed(2)}</p>
        </div> */}
        <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Minimum Points to Redeem</p>
          <p className="text-title-3 font-bold text-skin-primary-void">{data.minimum_points_required}</p>
        </div>
        <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Points Needed to Redeem</p>
          <p className="text-title-3 font-bold text-skin-primary-void">{data.points_needed}</p>
        </div>
         <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Redemption Amount</p>
          <p className="text-title-3 font-bold text-skin-primary-void">{redemptionAmount}</p>
        </div>
        <div className="bg-skin-white p-4 rounded-lg">
          <p className="text-content-2 text-skin-secondary">Can You Redeem?</p>
          <p className={`text-title-3 font-bold ${data.can_redeem ? 'text-green-600' : 'text-red-600'}`}>{data.can_redeem ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints; 