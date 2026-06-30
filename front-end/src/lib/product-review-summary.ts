import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { ProductReviewStats, ProductViewDetails } from '@/lib/config/product.config';
import { getReviewOrderByProductId } from '@/lib/server.actions';
import {
  AggregateRatingData,
  deriveAggregateRating,
  getRatingFromReviewResponse,
  mergeAggregateRatingData,
} from '@/lib/seo-schema';

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
  ratingData: AggregateRatingData | null;
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
  void [productId, productSlug, message, payload];
}

function ratingFromProductStats(
  stats: ProductReviewStats | null | undefined,
): AggregateRatingData | null {
  if (!stats) return null;
  return deriveAggregateRating(stats.total_reviews, stats.average_rating);
}

function initialDataFromRating(
  rating: AggregateRatingData,
  reviews: REVIEW_ORDER_RESPONSE['reviews'] = [],
  pagination?: ProductReviewInitialData['pagination'],
): ProductReviewInitialData {
  return {
    reviews,
    averageRating: rating.avgRating,
    totalReviews: rating.reviewCount,
    pagination,
  };
}

export function summaryFromReviewApiResponse(
  data: REVIEW_ORDER_RESPONSE | null | undefined,
): ProductReviewInitialData | null {
  const rating = data ? getRatingFromReviewResponse(data) : null;
  if (!rating) return null;

  return initialDataFromRating(
    rating,
    data?.reviews ?? [],
    data?.pagination
      ? {
          totalPages: data.pagination.totalPages ?? 0,
          currentPage: data.pagination.page ?? 1,
          limit: data.pagination.limit ?? 10,
        }
      : undefined,
  );
}

export function summaryFromProductPayload(
  product: ProductViewDetails,
): ProductReviewInitialData | null {
  const rating = ratingFromProductStats(product.review_stats);
  if (!rating) return null;
  return initialDataFromRating(rating);
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

function fulfilledReviewResult(
  response: ServerActionResponse<REVIEW_ORDER_RESPONSE>,
): PromiseSettledResult<ServerActionResponse<REVIEW_ORDER_RESPONSE>> {
  return { status: 'fulfilled', value: response };
}

/**
 * Resolve PDP review counts for SSR UI + JSON-LD.
 * Merges review API + product.review_stats so aggregateRating is emitted whenever
 * either source reports reviews (fixes listing vs PDP schema gaps).
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

  const payloadRating = product ? ratingFromProductStats(product.review_stats) : null;
  logPdpReview(productId, productSlug, 'product payload review_stats', {
    present: Boolean(product?.review_stats),
    total_reviews: payloadRating?.reviewCount ?? 0,
    average_rating: payloadRating?.avgRating ?? 0,
  });

  let reviewApiData: REVIEW_ORDER_RESPONSE | null = null;
  if (
    reviewApiResult?.status === 'fulfilled' &&
    reviewApiResult.value.status === ServerActionStatus.SUCCESS
  ) {
    reviewApiData = reviewApiResult.value.data;
  }

  const apiRating = reviewApiData ? getRatingFromReviewResponse(reviewApiData) : null;
  const mergedRating = mergeAggregateRatingData(apiRating, payloadRating);

  const fromReviewApi = summaryFromReviewApiResponse(reviewApiData);
  const fromPayload = product ? summaryFromProductPayload(product) : null;

  let initialData = fromReviewApi ?? fromPayload;
  let source: ProductReviewSummarySource = 'none';

  if (fromReviewApi) {
    source = 'review-api';
  } else if (fromPayload) {
    source = 'product-payload';
  }

  if (mergedRating) {
    if (initialData) {
      initialData = {
        ...initialData,
        totalReviews: Math.max(initialData.totalReviews, mergedRating.reviewCount),
        averageRating:
          initialData.averageRating > 0 ? initialData.averageRating : mergedRating.avgRating,
      };
    } else {
      initialData = initialDataFromRating(
        mergedRating,
        reviewApiData?.reviews ?? [],
        fromReviewApi?.pagination,
      );
      source = apiRating ? 'review-api' : 'product-payload';
    }

    logPdpReview(productId, productSlug, `using source=${source} (merged rating for schema)`, {
      totalReviews: mergedRating.reviewCount,
      averageRating: mergedRating.avgRating,
      apiReviewCount: apiRating?.reviewCount ?? 0,
      payloadReviewCount: payloadRating?.reviewCount ?? 0,
    });

    return { initialData, ratingData: mergedRating, source };
  }

  logPdpReview(productId, productSlug, 'using source=none — no review counts available');
  return { initialData: null, ratingData: null, source: 'none' };
}

/**
 * Resolve PDP reviews, retrying with product.id when slug entity_id returns no rating data.
 */
export async function resolvePdpReviewSummaryForProduct({
  productId,
  productSlug,
  product,
  entityId,
  reviewApiResult,
}: {
  productId: number;
  productSlug?: string;
  product?: ProductViewDetails;
  entityId: number;
  reviewApiResult: PromiseSettledResult<ServerActionResponse<REVIEW_ORDER_RESPONSE>>;
}): Promise<ResolvedProductReviewSummary> {
  const first = resolvePdpReviewSummary({
    productId,
    productSlug,
    reviewApiResult,
    product,
    reviewApiProductId: entityId,
  });

  const needsRetry =
    !first.ratingData &&
    productId > 0 &&
    entityId > 0 &&
    productId !== entityId;

  if (!needsRetry) {
    return first;
  }

  logPdpReview(productId, productSlug, 'retrying review API with product.id after empty entity_id result');
  const fallbackResponse = await getReviewOrderByProductId(productId, 1, 1);
  const retried = resolvePdpReviewSummary({
    productId,
    productSlug,
    reviewApiResult: fulfilledReviewResult(fallbackResponse),
    product,
    reviewApiProductId: productId,
  });

  if (retried.ratingData || retried.initialData) {
    return retried;
  }

  return first;
}
