'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { getReviewOrderByProductId } from '../server.actions';
import { ServerActionStatus } from '../config/app.config';
import { ProductReviewInitialData } from '../product-review-summary';

type ReviewData = ProductReviewInitialData;

const isReviewDebugEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_DEBUG_PDP_REVIEWS === 'true' ||
  process.env.NODE_ENV === 'development';

function logClientReview(productId: number, message: string, payload?: Record<string, unknown>): void {
  if (!isReviewDebugEnabled()) return;
  console.log(`[PDP Reviews][client] productId=${productId} — ${message}`, payload ?? '');
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
  /** Server-resolved summary so SSR HTML matches JSON-LD review counts */
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

      logClientReview(productId, 'fetching review summary via getReviewOrderByProductId');
      const response = await getReviewOrderByProductId(productId, 1, 1);

      if (response.status === ServerActionStatus.SUCCESS && response.data) {
        const next = {
          reviews: response.data.reviews || [],
          averageRating: parseFloat(response.data.average_rating) || 0,
          totalReviews: response.data.total_reviews || 0,
        };
        logClientReview(productId, 'review API success', {
          totalReviews: next.totalReviews,
          averageRating: next.averageRating,
          reviewsReturned: next.reviews.length,
        });
        setReviewData(next);
      } else {
        logClientReview(productId, 'review API error', {
          message: response.status === ServerActionStatus.ERROR ? response.message : 'unknown',
        });
        setError('Failed to fetch review summary');
      }
    } catch (err) {
      logClientReview(productId, 'review API exception', { error: String(err) });
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

  useEffect(() => {
    if (!productId) return;
    if (initialData) {
      logClientReview(productId, 'using server initialData (skipping client summary fetch)', {
        totalReviews: initialData.totalReviews,
        averageRating: initialData.averageRating,
      });
      return;
    }
    fetchReviewSummary(productId);
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
