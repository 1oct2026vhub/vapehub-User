import { useNotificationContext } from '@/lib/context/NotificationContext';

export const useNotificationCount = () => {
  const { unreadCount } = useNotificationContext();
  return unreadCount;
}; 