'use client';

import { FunctionComponent, PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';

interface Props extends PropsWithChildren { }

const GlobalProvider: FunctionComponent<Props> = ({
  children,
}): ReactElement => {
  const router = useRouter();

  return (

    <NextUIProvider navigate={router.push}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </NextUIProvider>
  );
};

export default GlobalProvider;
