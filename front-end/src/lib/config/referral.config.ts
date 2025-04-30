export interface ReferralStatsResponse {
  total_referrals: number;
  pending_referrals: number;
  total_points: number;
  recent_referrals: {
    id: number;
    status: string;
    points_awarded: number;
    created_at: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}
