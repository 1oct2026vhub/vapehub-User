import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { ProductViewDetails } from '@/lib/config/product.config';
import { getRatingFromReviewResponse } from '@/lib/seo-schema';

/** Shape consumed by ReviewProvider / PDP UI */
export type ProductReviewInitialData = {
  reviews: REVIEW_ORDER_RESPONSE['reviews'];
  averageRating: number;
  totalReviews: number;
  pagination?: {
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};

export type ProductReviewSummarySource = 'review-api' | 'product-payload' | 'none';

export type ResolvedProductReviewSummary = {
  initialData: ProductReviewInitialData | null;
  /** For JSON-LD aggregateRating */
  ratingData: ReturnType<typeof getRatingFromReviewResponse>;
  source: ProductReviewSummarySource;
};

const isReviewDebugEnabled = (): boolean =>
  process.env.DEBUG_PDP_REVIEWS === 'true' ||
  process.env.NODE_ENV === 'development';

function logPdpReview(
  productId: number,
  productSlug: string | undefined,
  message: string,
  payload?: Record<string, unknown>,
): void {
  if (!isReviewDebugEnabled()) return;
  console.log(
    `[PDP Reviews] productId=${productId}${productSlug ? ` slug=${productSlug}` : ''} — ${message}`,
    payload ?? '',
  );
}

export function summaryFromReviewApiResponse(
  data: REVIEW_ORDER_RESPONSE | null | undefined,
): ProductReviewInitialData | null {
  if (!data) return null;
  const totalReviews = data.total_reviews ?? 0;
  if (totalReviews <= 0) return null;

  return {
    reviews: data.reviews ?? [],
    averageRating: parseFloat(String(data.average_rating ?? 0)) || 0,
    totalReviews,
    pagination: data.pagination
      ? {
          totalPages: data.pagination.totalPages ?? 0,
          currentPage: data.pagination.page ?? 1,
          limit: data.pagination.limit ?? 10,
        }
      : undefined,
  };
}

export function summaryFromProductPayload(
  product: ProductViewDetails,
): ProductReviewInitialData | null {
  const stats = product.review_stats;
  if (!stats) return null;

  const totalReviews = stats.total_reviews ?? 0;
  if (totalReviews <= 0) return null;

  return {
    reviews: [],
    averageRating: parseFloat(String(stats.average_rating ?? 0)) || 0,
    totalReviews,
  };
}

function describeReviewApiResult(
  result: PromiseSettledResult<ServerActionResponse<REVIEW_ORDER_RESPONSE>> | null,
): Record<string, unknown> {
  if (!result) return { settled: false };
  if (result.status === 'rejected') {
    return { settled: true, status: 'rejected', reason: String(result.reason) };
  }
  const response = result.value;
  if (response.status === ServerActionStatus.ERROR) {
    return { settled: true, status: 'error', message: response.message };
  }
  return {
    settled: true,
    status: 'success',
    total_reviews: response.data.total_reviews,
    average_rating: response.data.average_rating,
    reviewsReturned: response.data.reviews?.length ?? 0,
  };
}

/**
 * Resolve PDP review counts for SSR UI + JSON-LD.
 * Prefers getReviewOrderByProductId (same endpoint as client fetch); falls back to
 * product.review_stats when the dedicated review API fails or returns empty.
 */
export function resolvePdpReviewSummary({
  productId,
  productSlug,
  reviewApiResult,
  product,
  reviewApiProductId,
}: {
  productId: number;
  productSlug?: string;
  reviewApiResult: PromiseSettledResult<ServerActionResponse<REVIEW_ORDER_RESPONSE>> | null;
  product?: ProductViewDetails;
  /** ID passed to getReviewOrderByProductId (slug entity_id); logged when it differs from productId */
  reviewApiProductId?: number;
}): ResolvedProductReviewSummary {
  if (reviewApiProductId != null && reviewApiProductId !== productId) {
    logPdpReview(productId, productSlug, 'WARNING: review API used different id than product.id', {
      reviewApiProductId,
      productId,
    });
  }

  logPdpReview(productId, productSlug, 'review API result', {
    reviewApiProductId: reviewApiProductId ?? productId,
    ...describeReviewApiResult(reviewApiResult),
  });

  const payloadStats = product ? summaryFromProductPayload(product) : null;
  logPdpReview(productId, productSlug, 'product payload review_stats', {
    present: Boolean(product?.review_stats),
    total_reviews: payloadStats?.totalReviews ?? 0,
    average_rating: payloadStats?.averageRating ?? 0,
  });

  let reviewApiData: REVIEW_ORDER_RESPONSE | null = null;
  if (
    reviewApiResult?.status === 'fulfilled' &&
    reviewApiResult.value.status === ServerActionStatus.SUCCESS
  ) {
    reviewApiData = reviewApiResult.value.data;
  }

  const fromReviewApi = summaryFromReviewApiResponse(reviewApiData);
  if (fromReviewApi) {
    logPdpReview(productId, productSlug, 'using source=review-api', {
      totalReviews: fromReviewApi.totalReviews,
      averageRating: fromReviewApi.averageRating,
    });
    return {
      initialData: fromReviewApi,
      ratingData: getRatingFromReviewResponse(reviewApiData),
      source: 'review-api',
    };
  }

  if (payloadStats) {
    logPdpReview(productId, productSlug, 'using source=product-payload (review API empty/failed)', {
      totalReviews: payloadStats.totalReviews,
      averageRating: payloadStats.averageRating,
    });
    return {
      initialData: payloadStats,
      ratingData: {
        avgRating: payloadStats.averageRating,
        reviewCount: payloadStats.totalReviews,
      },
      source: 'product-payload',
    };
  }

  logPdpReview(productId, productSlug, 'using source=none — no review counts available');
  return { initialData: null, ratingData: null, source: 'none' };
}
