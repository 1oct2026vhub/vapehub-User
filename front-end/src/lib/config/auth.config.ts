'use server';

import { getServerSession } from 'next-auth';
import { NEXT_AUTH_OPTIONS } from '@/app/api/auth/[...nextauth]/auth-options';
import { ROUTES } from '../routes';
import { permanentRedirect, RedirectType } from 'next/navigation';
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

// * Helper functions

/*
 * * To get the server session data
 * * @return { Promise<Session | null> }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServerSessionData = async (): Promise<any | null> =>
    await getServerSession(NEXT_AUTH_OPTIONS);
  
export const redirectIfAuthenticated = async (
  redirectUrl?: keyof typeof ROUTES
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