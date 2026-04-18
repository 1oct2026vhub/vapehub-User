'use server';

import { redirect, RedirectType } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/**
 * Handles an unauthorized session by removing cookies related to session tokens.
 */
export const handleUnauthorizedSession = async () => {
    redirect(ROUTES.UNAUTHORIZED, RedirectType.replace);
};
