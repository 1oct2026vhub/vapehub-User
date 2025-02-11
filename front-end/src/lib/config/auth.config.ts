'use server';

import { getServerSession } from 'next-auth';
import { NEXT_AUTH_OPTIONS } from '@/app/api/auth/[...nextauth]/auth-options';
import { ROUTES } from '../routes';
import { permanentRedirect, RedirectType } from 'next/navigation';
// import { ROUTES } from '@/lib/routes';
// import { permanentRedirect, RedirectType } from 'next/navigation';

// * Interface
export interface SignInResponse {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string;
    profile_pic_url: string;
    gender: string;
    dob: string;
    accessToken: string;
    refreshToken: string;
  }

// * Helper functions

/*
 * * To get the server session data
 * * @return { Promise<Session | null> }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServerSessionData = async (): Promise<any | null> =>
    await getServerSession(NEXT_AUTH_OPTIONS);
  
export const redirectIfAuthenticated = async (
  redirectUrl: keyof typeof ROUTES
): Promise<void> => {
  const session = await getServerSessionData();

  if (session?.user) {
    const user = session.user;
    if (!user.name) {
      return permanentRedirect(ROUTES.WELCOME, RedirectType.replace);
    }
    return permanentRedirect(
      ROUTES[redirectUrl ?? 'HOME'],
      RedirectType.replace
    );
  }
};