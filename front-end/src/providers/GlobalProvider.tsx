'use client';

import { FunctionComponent, PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/lib/context/CartContext';
import { AgeVerificationProvider } from '@/lib/context/AgeVerificationContext';
import { NotificationProvider } from '@/lib/context/NotificationContext';

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
              {children}
            </NotificationProvider>
          </CartProvider>
        </AgeVerificationProvider>
      </SessionProvider>
    </NextUIProvider>
  );
};

export default GlobalProvider;
