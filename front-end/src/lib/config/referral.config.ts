export interface ReferralMethods {
  id: number;
  referral_value_type: "percentage" | "fixed";
  referral_value: string;
  status: string;
  primary: boolean;
}
export interface RecentReferrals {
   
    id: string;
    referrer_id: number;
    referred_user_id: number | null;
    referral_code: string;
    referral_coupon_code: string;
    status: "pending" | "completed" | "applied";
    referral_value_type: "percentage" | "fixed";
    referral_value: string | null;
    referred_user: {
      id: number;
      name: string;
      email: string;
    } | null; 
    
}
export interface ReferralStatsResponse {
  total_referrals: number;
  pending_referrals: number; 
  referred_coupon_code: string | null;
  referrer: {
  id: number;
  name: string;
  email: string;
  referral_code: string;
  referral_coupon_code: string;
  referral_value: string;
  referral_value_type: "percentage" | "fixed";
  status: "pending" | "completed" | "applied";
  points_awarded: number;
  order_id: number;
  referred_user_id: number;
  created_at: string;
  updated_at: string;
  } | null;
  referral_methods: ReferralMethods[];
  recent_referrals: {
    data:  RecentReferrals[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  }
  }
}
