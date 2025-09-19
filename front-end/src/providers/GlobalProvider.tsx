'use client';

import { FunctionComponent, PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/lib/context/CartContext';
import { AgeVerificationProvider } from '@/lib/context/AgeVerificationContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { SubscriptionProvider } from '@/lib/context/SubscriptionContext';

const GlobalProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}): ReactElement => {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <SessionProvider>
        <AgeVerificationProvider>
          <CartProvider>
            <NotificationProvider>
              <SubscriptionProvider>
                {children}
              </SubscriptionProvider>
            </NotificationProvider>
          </CartProvider>
        </AgeVerificationProvider>
      </SessionProvider>
    </NextUIProvider>
  );
};

export default GlobalProvider;
