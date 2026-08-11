'use server';
import {  
  ServerActionResponse,
  ServerActionStatus,
  UNAUTHORIZED_RESPONSE_NAME,
} from '@/lib/config/app.config';
import { handleUnauthorizedSession } from '@/lib/auth.actions';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

/**
 * Reads the backend API Bearer token from the encrypted NextAuth JWT cookie.
 * Private to this module — never expose via session / client-reachable actions.
 */
const getBackendAccessToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  const token = await getToken({
    // SessionStore accepts Next.js cookies() (has getAll).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: { cookies: cookieStore } as any,
  });

  if (!token) return undefined;

  const accessToken =
    (typeof token.accessToken === 'string' && token.accessToken) ||
    (typeof token.sub === 'string' && token.sub) ||
    undefined;

  return accessToken || undefined;
};

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
    const REQUEST_TIMEOUT_MS = 20000;

const fetchWithRetry = async (
  input: RequestInfo,
  init: RequestInit | undefined,
  retries: number,
  timeoutMs: number
): Promise<Response> => {
  const executeFetch = () =>
    fetch(input, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });

  try {
    const response = await executeFetch();
    if (!response.ok && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(input, init, retries - 1, timeoutMs);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(input, init, retries - 1, timeoutMs);
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
      const resolvedTimeoutMs = timeoutMs ?? REQUEST_TIMEOUT_MS;

      const response = await fetchWithRetry(
        endpoint,
        {
          method,
          headers,
          body: buildRequestBody(requestData),
          cache: resolvedCache,
          next: resolvedNext,
        },
        retries,
        resolvedTimeoutMs
      );
          
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
  
    // Only attach Authorization for non-cached (protected) APIs.
    // Read the Bearer token from the encrypted JWT (server-only) — never from session.user,
    // which is exposed to client JS via /api/auth/session.
    if (!canCache) {
      const accessToken = await getBackendAccessToken();

      if (accessToken) {
        headers.append('Authorization', `Bearer ${accessToken}`);
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
  