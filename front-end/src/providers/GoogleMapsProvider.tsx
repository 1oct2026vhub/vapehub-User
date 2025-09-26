'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface GoogleMapsContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  google: typeof google | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Listen for custom events from the script loader
    const handleGoogleMapsLoaded = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
    };

    const handleGoogleMapsError = () => {
      // event: CustomEvent
      const error = new Error('Failed to load Google Maps API');
      setError(error);
      setIsLoading(false);
    };

    // Add event listeners
    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    window.addEventListener('googleMapsError', handleGoogleMapsError as EventListener);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
      window.removeEventListener('googleMapsError', handleGoogleMapsError as EventListener);
    };
  }, []);

  const value = {
    isLoaded,
    isLoading,
    error,
    google: typeof window !== 'undefined' && window.google ? window.google : null,
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
