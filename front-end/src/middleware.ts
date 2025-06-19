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

  const response = NextResponse.next()
  const url = request.nextUrl.clone()

  // Check if 'referral_code' is in the query parameters
  if (url.searchParams.has('referral_code')) {
    const referralCode = url.searchParams.get('referral_code')
    if (referralCode) {
      // Set the cookie on the response
      response.cookies.set('referral_code', referralCode, {
        path: '/',
        // Add other cookie options like maxAge, httpOnly, secure if needed
      })
    }
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/:path*',
} 