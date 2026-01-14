'use server';
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
    }
  | {
      endpoint: string;
      method: 'GET' | 'DELETE';
      canCache?: boolean;
    };

    const MAX_RETRIES = 0;
    const RETRY_DELAY = 1000; // in milliseconds

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
    const { endpoint, method, canCache = false } = requestData;
    try {
      const headers = await buildHeaders(requestData, canCache);
      
      // Log API call request
      // const hasPayloadData = ['POST', 'PUT', 'PATCH'].includes(method);
      // console.log(`[API Request] ${method} ${endpoint}`, {
      //   method,
      //   endpoint,
      //   hasPayload: hasPayloadData,
      //   canCache,
      // });
      
      const response = await fetchWithRetry(endpoint, {
        method,
        headers,
        body: buildRequestBody(requestData),
        cache: canCache ? 'force-cache' : 'no-store',
        next: canCache ? { revalidate: 60 } : undefined,
      }, MAX_RETRIES);
          
      const responseJson = await response.json();

      if (response.status === 401) {                
        return {
          status: ServerActionStatus.ERROR,
          message: responseJson.error?.message ?? responseJson.message ??
          UNAUTHORIZED_RESPONSE_NAME,  
        }
      }
  
    //   if (response.status >= 500) {
    //     throw new Error(INTERNAL_SERVER_ERROR);
    //   }      
      
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
      
      // // Log API call error
      // console.error(`[API Error] ${method} ${endpoint}`, {
      //   method,
      //   endpoint,
      //   error: errMessage,
      //   errorObject: err,
      // });
      
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
  