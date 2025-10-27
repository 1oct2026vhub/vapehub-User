"use client"
import React from 'react';
import { Button } from '@nextui-org/button';
import { Popover, PopoverTrigger, PopoverContent, Badge } from '@nextui-org/react';
import { BellIcon, OrderIcon, PaymentIcon, ProductIcon, ShippingIcon } from '@/components/Icons';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationList } from '@/lib/config/notification.config';
import { useRouter } from 'next/navigation';

const NotificationAction: React.FC = () => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const { status } = useSession();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const isLoggedIn = status === "authenticated";
  const [tab, setTab] = React.useState<'all' | 'unread'>('all');
  const router = useRouter();

  if (!isLoggedIn) return null;

  // Group notifications by date (Today, Yesterday, etc.)
  const groupByDate = (list: NotificationList[] = []): Record<string, NotificationList[]> => {
    const arr = Array.isArray(list) ? list : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const format = (d: Date) => d.toISOString().slice(0, 10);

    return arr.reduce<Record<string, NotificationList[]>>((acc, n) => {
      const notificationDate = new Date(n.created_at);
      notificationDate.setHours(0, 0, 0, 0);

      if (notificationDate.getTime() === today.getTime()) {
        (acc['Today'] = acc['Today'] || []).push(n);
      } else if (notificationDate.getTime() === yesterday.getTime()) {
        (acc['Yesterday'] = acc['Yesterday'] || []).push(n);
      } else {
        (acc[format(notificationDate)] = acc[format(notificationDate)] || []).push(n);
      }
      return acc;
    }, {});
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filtered: NotificationList[] = tab === 'all' ? safeNotifications : safeNotifications.filter((n: NotificationList) => !n.is_read);
  const grouped: Record<string, NotificationList[]> = groupByDate(filtered);

  return (
    <Popover showArrow offset={25} isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement="bottom" shadow="lg">
      <PopoverTrigger>
        <Badge color="danger" content={unreadCount > 99 ? "99+" : unreadCount} shape="circle" className='!border-0 max-sm:text-xs w-auto min-w-5 max-h-6 md:max-h-7 aspect-square'>
          <Button isIconOnly aria-label="more than 99 notifications" radius="full" variant="light" className='!min-w-fit !w-fit !h-fit !items-end' onPress={() => setIsPopoverOpen((v) => !v)}>
            <BellIcon className='mt-1 text-white' />
          </Button>
        </Badge>

      </PopoverTrigger>
      <PopoverContent className="max-w-[320px] sm:min-w-[380px] sm:max-w-[420px]">
        <div className='w-full max-w-full'>
          <div className="border-b pt-4 pb-2 bg-white rounded-t-lg px-3">
            <div className="font-bold text-lg">Notifications</div>
            <div className="text-xs text-gray-500 mb-2">Stay Updated with Your Latest Notifications</div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <button onClick={() => setTab('all')} className={`text-sm px-2 py-1 rounded ${tab === 'all' ? 'font-semibold text-skin-primary-400 border-b-2 border-skin-primary-400' : 'text-gray-500'}`}>All</button>
                <button onClick={() => setTab('unread')} className={`text-sm px-2 py-1 rounded ${tab === 'unread' ? 'font-semibold text-skin-primary-400 border-b-2 border-skin-primary-400' : 'text-gray-500'}`}>Unread ({unreadCount})</button>
              </div>
              <Button onPress={markAllAsRead} className="flex-end text-xs primary-gradient-100 hover:underline">Mark all as read</Button>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto bg-white max-w-full pb-2">
            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([date, notification]) => (
                <div key={date} className="mb-2">
                  <div className="text-xs font-semibold text-gray-400 px-3 py-1">{date === 'Today' || date === 'Yesterday' ? date : (() => { const d = new Date(date); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); })()}</div>
                  {(notification as NotificationList[]).map((notification: NotificationList) => {
                    const handleClick = async () => {
                      if (!notification.is_read) {
                        await markAsRead(notification.id);
                        if (notification.url) {
                          router.push(notification.url);
                        }
                        setIsPopoverOpen(false);
                      } else {
                        if (notification.url) {
                          router.push(notification.url);
                          setIsPopoverOpen(false);
                        }
                      }
                    };
                    return (
                      <div
                        key={notification.id}
                        className="flex sm:min-w-[328px] items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 relative cursor-pointer"
                        onClick={handleClick}
                      >
                        {/* Icon/avatar */}
                        <div className="mt-1">

                          {notification.type === 'order' ? <OrderIcon className="w-8 h-8 text-skin-primary-400" /> :
                            notification.type === 'payment' ? <PaymentIcon className="w-8 h-8 text-skin-primary-400" /> :
                              notification.type === 'shipping' ? <ShippingIcon className="w-8 h-8 text-skin-primary-400" /> :
                                notification.type === 'product' ? <ProductIcon className="w-8 h-8 text-skin-primary-400" /> :
                                  <BellIcon className="w-8 h-8 text-skin-primary-400" />}

                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{notification.title}</div>
                          {/* after 3 lines, add ... */}
                          <div className="text-xs text-gray-600 truncate whitespace-normal line-clamp-2">{notification.message}</div>
                          <div className="text-[11px] text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                        </div>
                        {!notification.is_read && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 min-w-[328px] px-3">
                <span className="font-semibold text-content-2">No Notifications</span>
                <span className="text-content-3 text-sm text-center">You have no new notifications.</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>

    </Popover>
  );
};

export default NotificationAction; 