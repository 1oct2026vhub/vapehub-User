export interface LoyaltyPointsRedemptionResponse {
  user_points: number;
  minimum_points_required: number;
  can_redeem: boolean;
  points_needed: number;
  redemption_amount: number | string;
  redemption_type: string;
  points_value: string;
  total_points_value: number | string;
} 