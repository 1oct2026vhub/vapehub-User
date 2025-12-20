'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMailSubscriptionSettings } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { loadEnvFile } from 'node:process';

interface SubscriptionSettings {
  id: number;
  email_frequency: string;
  product_updates: boolean;
  discount_notifications: boolean;
  discount_amount: string;
  discount_type: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionContextType {
  subscriptionSettings: SubscriptionSettings | null;
  loading: boolean;
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  initialSettings?: SubscriptionSettings | null;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ 
  children, 
  initialSettings = null 
}) => {
  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings | null>(initialSettings);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have initial settings
    if (!initialSettings) {
      const fetchSubscriptionSettings = async () => {
        console.log('[fetchSubscriptionSettings] Starting to fetch subscription settings');
        try {
          setLoading(true);
          setError(null);
          console.log('[fetchSubscriptionSettings] Calling getMailSubscriptionSettings...');
          
          const response = await getMailSubscriptionSettings();
          console.log('[fetchSubscriptionSettings] Response received:', response);
          
          if (response.status === ServerActionStatus.SUCCESS) {
            console.log('[fetchSubscriptionSettings] Success - Setting subscription settings:', response.data);
            setSubscriptionSettings(response.data);
          } else {
            const errorMessage = response.message || 'Failed to fetch subscription settings';
            console.warn('[fetchSubscriptionSettings] Failed with status:', response.status, 'Message:', errorMessage);
            setError(errorMessage);
          }
        } catch (err) {
          console.error('[fetchSubscriptionSettings] Error occurred:', err);
          setError('An error occurred while fetching subscription settings');
        } finally {
          console.log('[fetchSubscriptionSettings] Fetch completed, setting loading to false');
          setLoading(false);
        }
      };

      fetchSubscriptionSettings();
    }
  }, [initialSettings]);

  return (
    <SubscriptionContext.Provider value={{ subscriptionSettings, loading, error }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
