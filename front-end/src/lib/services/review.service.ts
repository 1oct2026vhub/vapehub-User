import { getReviewOrderByProductId } from '@/lib/server.actions';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';

class ReviewService {
  private cache: Map<number, Promise<ServerActionResponse<REVIEW_ORDER_RESPONSE>>> = new Map();

  public getReview(productId: number): Promise<ServerActionResponse<REVIEW_ORDER_RESPONSE>> {
    if (!this.cache.has(productId)) {
      const fetchPromise = getReviewOrderByProductId(productId, 1, 1).catch(error => {
        // Ensure that if the API call fails, we remove the promise from the cache
        // so that subsequent attempts can try again.
        this.cache.delete(productId);
        // Re-throw the error to be caught by the component
        throw error;
      });
      this.cache.set(productId, fetchPromise);
    }
    return this.cache.get(productId)!;
  }
}

export const reviewService = new ReviewService(); 