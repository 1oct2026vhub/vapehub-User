import { ReactElement } from "react";

// * Interfaces
export type ServerActionResponse<T> =
    | {
        status: ServerActionStatus.ERROR;
        message: string;
        errorData?: T;
    }
    | {
        status: ServerActionStatus.SUCCESS;
        data: T;
    };

// * Enum
export enum ServerActionStatus {
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
  }

export type AsyncReactElement = Promise<ReactElement>;

export const UNAUTHORIZED_RESPONSE_NAME: string = 'UNAUTHORIZED';

export const INTERNAL_SERVER_ERROR: string =
    'Something went wrong. Please try again later';

export type Undefined<T> = T | undefined;

export type RouteParams = Record<string, Undefined<string>>;

/**
 * * Build a value from the given route parameters
 * @param  { string } key
 * @param { RouteParams | undefined } params
 * @param defaultValue
 * @returns
 */
export const getQueryParamValue = <T extends string | number>(
    key: string,
    params: RouteParams | undefined,
    defaultValue: T
  ): T => {
    const qParams =
      params && typeof params[key] === 'string'
        ? params[key] ?? defaultValue
        : defaultValue;
  
    if (typeof defaultValue === 'string') {
      return (typeof qParams === 'string' ? qParams : qParams.toString()) as T;
    }
    if (typeof qParams === 'number') return qParams as T;
  
    if (Array.isArray(qParams)) return qParams.toString() as T;
  
    return Number.isNaN(Number(qParams.toString()))
      ? defaultValue
      : (Number(qParams) as T);
  };