'use client';

import Script from 'next/script';

const GoogleMapsScript = () => {
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`}
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('googleMapsLoaded'));
          }, 100);
        }
      }}
      onError={(e) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('googleMapsError', { detail: e }));
        }
      }}
    />
  );
};

export default GoogleMapsScript;
