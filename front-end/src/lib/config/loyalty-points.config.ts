export interface LoyaltyRedemptionMailSubscriptionData {
  isDiscountUsed: boolean;
  discount_amount: number;
  discount_type: string;
}

/** GET /api/loyalty-points/redemption */
export interface LoyaltyPointsRedemptionResponse {
  user_points: number;
  minimum_points_required: number;
  minimum_order_value_to_redeem?: number;
  can_redeem: boolean;
  has_enough_points?: boolean;
  meets_minimum_order_value?: boolean;
  points_needed: number;
  loyalty_amount_type?: string;
  points_value: string;
  min_amount_for_loyalty_points?: string;
  amount_divisor?: string;
  redemption_type: string;
  redemption_model?: string;
  percent_per_tier?: number;
  points_per_tier?: number;
  redemption_amount: number | string;
  max_percent_at_balance?: number;
  tiers_at_balance?: number;
  mail_subscription_data?: LoyaltyRedemptionMailSubscriptionData | null;
  /** Legacy field; not always returned */
  total_points_value?: number | string;
}
