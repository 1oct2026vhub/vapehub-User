import {  
  ServerActionResponse,
  ServerActionStatus,
  UNAUTHORIZED_RESPONSE_NAME,
} from '@/lib/config/app.config';
import { getServerSessionData } from '@/lib/config/auth.config';
import { handleUnauthorizedSession } from '@/lib/auth.actions';

// * Types
type HandleRequest<G> =
  | {
      endpoint: string;
      payload: G;
      method: 'POST' | 'PUT' | 'PATCH';
      canCache?: boolean;
      cacheStrategy?: 'no-store' | 'force-cache' | { revalidate: number };
      timeoutMs?: number;
    }
  | {
      endpoint: string;
      method: 'GET' | 'DELETE';
      canCache?: boolean;
      cacheStrategy?: 'no-store' | 'force-cache' | { revalidate: number };
      timeoutMs?: number;
    };

    const MAX_RETRIES = 1;
    const RETRY_DELAY = 1000; // in milliseconds
    const REQUEST_TIMEOUT_MS = 5000;

/** filter-variants can return large variant sets and exceed the default 5s timeout. */
export const PRODUCT_VARIANT_FILTER_TIMEOUT_MS = 20_000;

    const fetchWithRetry = async (input: RequestInfo, init?: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
      try {
        const response = await fetch(input, init);
        if (!response.ok && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return fetchWithRetry(input, init, retries - 1);
        }
        return response;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return fetchWithRetry(input, init, retries - 1);
        }
        throw error;
      }
    };
// * API helper functions
export const handleRequest = async <T, G>(
    requestData: HandleRequest<G>
  ): Promise<ServerActionResponse<T>> => {
    const { endpoint, method, canCache = false, cacheStrategy, timeoutMs } = requestData;
    const retries = method === 'GET' ? MAX_RETRIES : 0;
    const resolvedCache = cacheStrategy
      ? typeof cacheStrategy === 'string'
        ? cacheStrategy
        : 'force-cache'
      : canCache
        ? 'force-cache'
        : 'no-store';
    const resolvedNext = cacheStrategy
      ? typeof cacheStrategy === 'string'
        ? undefined
        : { revalidate: cacheStrategy.revalidate }
      : canCache
        ? { revalidate: 60 }
        : undefined;
    try {
      const headers = await buildHeaders(requestData, canCache);
      
      const response = await fetchWithRetry(endpoint, {
        method,
        headers,
        body: buildRequestBody(requestData),
        signal: AbortSignal.timeout(timeoutMs ?? REQUEST_TIMEOUT_MS),
        cache: resolvedCache,
        next: resolvedNext,
      }, retries);
          
      const responseJson = await response.json();

      if (response.status === 401) {                
        return {
          status: ServerActionStatus.ERROR,
          message: responseJson.error?.message ?? responseJson.message ??
          UNAUTHORIZED_RESPONSE_NAME,  
        }
      }

      if (response.status >= 500) {
        return {
          status: ServerActionStatus.ERROR,
          errorData: responseJson?.data ?? undefined,
          message:
            responseJson.error?.message ??
            responseJson.message ??
            'Oops! Something went wrong. Please try again later.',
        };
      }
      
      return responseJson.success
        ? {
            status: ServerActionStatus.SUCCESS,
            data: responseJson.data,
          }
        : {
            status: ServerActionStatus.ERROR,
            errorData: responseJson?.data ?? undefined,
            message:
            responseJson.error?.message ?? responseJson.message ??
              'Oops! Something went wrong. Please try again later.',
          };
    } catch (err: unknown) {
        let errMessage = "An unexpected error occurred"; // Default error message
        if (err instanceof Error) {
            errMessage = err.message; // ✅ Safe access to error message
          }
      
      if (errMessage === UNAUTHORIZED_RESPONSE_NAME) {
        await handleUnauthorizedSession();
      }
  
      return {
        status: ServerActionStatus.ERROR,
        message:
          errMessage ?? 'Oops! Something went wrong. Please try again later.',
      };
    }
  };

  
const buildHeaders = async <G>(
    requestData: HandleRequest<G>,
    canCache: boolean
  ): Promise<HeadersInit> => {
    const headers = new Headers();
  
    // Only fetch session and add Authorization header for non-cached (protected) APIs
    if (!canCache) {
      const session = await getServerSessionData();
      
      if (session?.user) {
        headers.append('Authorization', `Bearer ${session.user.accessToken}`);
      }
    }
  
    if (!(hasPayload(requestData) && isFormData(requestData.payload))) {
      headers.append('Content-Type', 'application/json');
    }
  
    return headers;
  };
  
  const buildRequestBody = <G>(
    requestData: HandleRequest<G>
  ): BodyInit | null | undefined => {
    if (hasPayload(requestData)) {
      const payload = requestData.payload;
      return isFormData(payload) ? payload : JSON.stringify(payload);
    }
  
    return null;
  };
  
  const hasPayload = <G>(
    requestData: HandleRequest<G>
  ): requestData is {
    endpoint: string;
    payload: G;
    method: 'POST' | 'PUT' | 'PATCH';
  } => {
    return ['POST', 'PUT', 'PATCH'].includes(requestData.method);
  };
  
  const isFormData = <G>(payload: G | FormData): payload is FormData => {
    return payload instanceof FormData;
  };
  