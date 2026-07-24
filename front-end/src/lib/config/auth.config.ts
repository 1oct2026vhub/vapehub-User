'use server';

import { getServerSession } from 'next-auth';
import { NEXT_AUTH_OPTIONS } from '@/app/api/auth/[...nextauth]/auth-options';
import { ROUTES } from '../routes';
import { permanentRedirect, RedirectType } from 'next/navigation';
import { ServerActionStatus } from './app.config';
// import { ROUTES } from '@/lib/routes';
// import { permanentRedirect, RedirectType } from 'next/navigation';

export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

// * Interface
export interface SignInResponse extends User {
     
    phone: string;
    profile_pic_url: string;
    gender: string;
    dob: string;
    accessToken: string;
    refreshToken: string;
  }
 
  export interface VerifyUserEmailResponse {
    message: string;
    signInResponse: SignInResponse;
  }

export interface ContactInfo {
    id: number;
    send_us_a_message: string;
    call_us: string;
    social_media: string;
    facebook: string;
    whatsapp: string;
    instagram: string;
    email: string;
    phone_number: string;
}

export interface ContactInfoResponse {
    status: ServerActionStatus;
    message: string;
    data?: ContactInfo;
}

export interface SocialMedia {
    instagram: string;
    whatsapp: string;
    facebook: string;
    email: string;
    phone_number: string;
}

export interface SocialMediaResponse {
    status: ServerActionStatus;
    message: string;
    data?: SocialMedia;
}

// * Helper functions

/*
 * * To get the server session data
 * * @return { Promise<Session | null> }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServerSessionData = async (): Promise<any | null> =>
    await getServerSession(NEXT_AUTH_OPTIONS);
  
type StringRouteKey = {
  [K in keyof typeof ROUTES]: (typeof ROUTES)[K] extends string ? K : never;
}[keyof typeof ROUTES];

export const redirectIfAuthenticated = async (
  redirectUrl?: StringRouteKey
): Promise<void> => {
  const session = await getServerSessionData();

  if (session?.user) {
    const user = session.user;
    if (!user.name) {
      return permanentRedirect(ROUTES.MY_ACCOUNT, RedirectType.replace);
    }
    return permanentRedirect(
      ROUTES[redirectUrl ?? 'MY_ACCOUNT'],
      RedirectType.replace
    );
  }
};

export const redirectIfUnauthenticated = async (): Promise<void> => {
  const session = await getServerSessionData();
  if (!session?.user) {
    return permanentRedirect(ROUTES.MY_ACCOUNT, RedirectType.replace);
  }
};