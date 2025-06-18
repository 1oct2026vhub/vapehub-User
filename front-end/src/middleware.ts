import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTES } from '@/lib/routes'

// Protected routes that require authentication
const protectedRoutes = [
  ROUTES.MY_ACCOUNT_ORDERS,
  ROUTES.MY_ACCOUNT_PERSONAL_INFO,
  ROUTES.MY_ACCOUNT_REFERRALS,
  ROUTES.MY_ACCOUNT_ADDRESSES,
  ROUTES.MY_ACCOUNT_SECURITY,
]

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Check if the current path is in the protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login page if not authenticated
      const url = new URL(ROUTES.MY_ACCOUNT, request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  const referralCode = request.nextUrl.searchParams.get('referral_code')
  
  // If we are on the register page, no need to redirect, just set the cookie and continue
  if(request.nextUrl.pathname.includes('/my-account')){
    const response = NextResponse.next();
    if (referralCode && request.cookies.get('referral_code')?.value !== referralCode) {
      response.cookies.set('referral_code', referralCode, { path: '/' });
    }
    return response;
  }
  
  if (referralCode) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('referral_code');
    const response = NextResponse.redirect(url)
    
    if (request.cookies.get('referral_code')?.value !== referralCode) {
      response.cookies.set('referral_code', referralCode, { path: '/' });
    }
    return response
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/my-account/orders/:path*',
    '/my-account/personal-info/:path*',
    '/my-account/referrals/:path*',
    '/my-account/addresses/:path*',
    '/my-account/security/:path*',
  ],
} 