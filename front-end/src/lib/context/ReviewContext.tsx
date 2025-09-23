'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { getReviewOrderByProductId } from '../server.actions';
import { ServerActionStatus } from '../config/app.config';
import { REVIEWS } from '../config/order.config';

interface ReviewData {
  reviews: REVIEWS[];
  averageRating: number;
  totalReviews: number;
  pagination?: {
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface ReviewContextType {
  reviewData: ReviewData | null;
  loading: boolean;
  error: string | null;
  fetchReviews: (productId: number, page?: number, limit?: number) => Promise<void>;
  fetchReviewSummary: (productId: number) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

interface ReviewProviderProps extends PropsWithChildren {
  productId?: number;
  initialData?: ReviewData | null;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ 
  children, 
  productId,
  initialData = null 
}) => {
  const [reviewData, setReviewData] = useState<ReviewData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewSummary = useCallback(async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getReviewOrderByProductId(productId, 1, 1);
      
      if (response.status === ServerActionStatus.SUCCESS && response.data) {
        setReviewData({
          reviews: response.data.reviews || [],
          averageRating: parseFloat(response.data.average_rating) || 0,
          totalReviews: response.data.total_reviews || 0,
        });
      } else {
        setError('Failed to fetch review summary');
      }
    } catch (err) {
      setError('An error occurred while fetching review summary');
      console.error('Review summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (productId: number, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getReviewOrderByProductId(productId, page, limit);
      
      if (response.status === ServerActionStatus.SUCCESS && response.data) {
        setReviewData({
          reviews: response.data.reviews || [],
          averageRating: parseFloat(response.data.average_rating) || 0,
          totalReviews: response.data.total_reviews || 0,
          pagination: {
            totalPages: response.data.pagination?.totalPages || 0,
            currentPage: page,
            limit: limit,
          },
        });
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError('An error occurred while fetching reviews');
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch review summary if productId is provided and no initial data
  useEffect(() => {
    if (productId && !initialData) {
      fetchReviewSummary(productId);
    }
  }, [productId, initialData, fetchReviewSummary]);

  return (
    <ReviewContext.Provider value={{ 
      reviewData, 
      loading, 
      error, 
      fetchReviews, 
      fetchReviewSummary 
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};
