'use client';

import Script from 'next/script';

const GoogleMapsScript = () => {
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('Google Maps API loaded successfully');
        // Dispatch custom event to notify components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('googleMapsLoaded'));
        }
      }}
      onError={(e) => {
        console.error('Failed to load Google Maps API:', e);
        // Dispatch custom event to notify components of error
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('googleMapsError', { detail: e }));
        }
      }}
    />
  );
};

export default GoogleMapsScript;
