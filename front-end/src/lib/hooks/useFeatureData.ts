'use client'

import { useState, useEffect } from 'react';
import { getFeatureContent } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { FeatureContent } from '@/lib/config/content.config';

interface FeatureDataHook {
  features: FeatureContent[] | null;
  loading: boolean;
  error: string | null;
}

export const useFeatureData = (): FeatureDataHook => {
  const [features, setFeatures] = useState<FeatureContent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getFeatureContent({ page: 1, limit: 4 });
        
        if (response.status === ServerActionStatus.SUCCESS && response.data?.featureContent) {
          setFeatures(response.data.featureContent);
        } else {
          setError('Failed to fetch features data');
        }
      } catch (err) {
        setError('An error occurred while fetching features data');
        console.error('Features fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return { features, loading, error };
};
