import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  getNotificationList,
  getUnreadNotificationCount,
  readNotification,
  readAllNotifications,
  deleteNotification
} from '@/lib/server.actions';
import { NotificationList } from '@/lib/config/notification.config';
import { ServerActionStatus } from '@/lib/config/app.config';
import { useSession } from 'next-auth/react';

interface NotificationContextType {
  notifications: NotificationList[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotificationById: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationList[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const {status} = useSession();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [notifyRes, countRes] = await Promise.all([
        getNotificationList(),
        getUnreadNotificationCount()
      ]); 
      setNotifications(
        notifyRes.status === ServerActionStatus.SUCCESS
          ? notifyRes.data.rows || []
          : []
      );
      setUnreadCount(
        countRes.status === ServerActionStatus.SUCCESS
          ? countRes.data?.count || 0
          : countRes.errorData?.count || 0
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    await readNotification(id);
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    await readAllNotifications();
    await fetchNotifications();
  }, [fetchNotifications]);

  const deleteNotificationById = useCallback(async (id: number) => {
    await deleteNotification(id);
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if(status === 'authenticated') {
      fetchNotifications();
    }
  }, [fetchNotifications, pathname, status]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotificationById
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}; 