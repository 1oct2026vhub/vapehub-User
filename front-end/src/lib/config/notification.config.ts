export interface NotificationList {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type:  "order" | "payment" | "system" | "product" | "shipping";
  related_id: number | null;
  is_read: boolean;
  is_pushed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  rows: NotificationList[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
  };

}
