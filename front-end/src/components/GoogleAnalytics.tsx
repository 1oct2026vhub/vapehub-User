'use client';

import { FunctionComponent, ReactElement, useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { GATagPageView } from '@/lib/analytics/gtagHelper';

const GoogleAnalytics: FunctionComponent<{
  GA_MEASUREMENT_ID: string;
}> = ({ GA_MEASUREMENT_ID }): ReactElement | null => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const url = pathname + searchParams.toString();
      GATagPageView(GA_MEASUREMENT_ID, url);
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        strategy='afterInteractive'
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      <Script id='google-analytics' strategy='afterInteractive'>
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
               gtag('consent', 'default', {
                    'analytics_storage': 'denied'
                });
                
              gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              });
          `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
