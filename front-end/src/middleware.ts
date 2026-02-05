import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ROUTES } from '@/lib/routes'
import { API_ROUTES } from '@/lib/api-routes'

// Protected routes that require authentication
const protectedRoutes = [
  ROUTES.MY_ACCOUNT_ORDERS,
  ROUTES.MY_ACCOUNT_PERSONAL_INFO,
  ROUTES.MY_ACCOUNT_REFERRALS,
  ROUTES.MY_ACCOUNT_ADDRESSES,
  ROUTES.MY_ACCOUNT_SECURITY,
  ROUTES.MY_ACCOUNT_LOYALTY_POINTS, // Add loyalty points route
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware work for Next internals, APIs, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // any file extension (e.g. .png, .css, .js)
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // Check if the current path is in the protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login page if not authenticated
      const url = new URL(ROUTES.MY_ACCOUNT, request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Handle SEO-friendly 301 redirects for deleted/unpublished product slugs
  // based on slug-relation API response: { success: true, data: { redirect, redirect_url } }
  let response: NextResponse
  const redirectDestination = await resolveRedirectDestination(request)
  if (redirectDestination) {
    response = NextResponse.redirect(redirectDestination, 301)
  } else {
    response = NextResponse.next()
  }

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

async function resolveRedirectDestination(request: NextRequest): Promise<URL | null> {
  // Only redirect on navigations (GET/HEAD)
  if (request.method !== 'GET' && request.method !== 'HEAD') return null

  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)
  const primarySlug = segments[0]
  if (!primarySlug) return null

  // Avoid calling slug-relation for account/auth/etc. pages
  if (
    protectedRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith(ROUTES.MY_ACCOUNT) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return null
  }

  // Heuristic: only check "content-like" paths (1-2 segments) to reduce load
  if (segments.length > 2) return null

  try {
    const endpoint = API_ROUTES.GET_DYNAMIC_PAGE_SLUG(primarySlug)
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const json = (await res.json()) as {
      success?: boolean
      data?: { redirect?: boolean; redirect_url?: string }
    }

    if (!json?.success || !json.data?.redirect || !json.data.redirect_url) return null

    const normalized = normalizeRedirectUrl(json.data.redirect_url)
    if (!normalized) return null

    // Prevent redirect loops
    if (normalized === pathname) return null

    // Build final URL (absolute or relative)
    if (/^https?:\/\//i.test(normalized)) {
      return new URL(normalized)
    }
    return new URL(normalized, request.url)
  } catch {
    return null
  }
}

function normalizeRedirectUrl(input: string): string | null {
  let dest = (input ?? '').trim()
  if (!dest) return null

  // Some responses come as "/https://example.com/path" – fix that
  if (dest.startsWith('/http://') || dest.startsWith('/https://')) {
    dest = dest.slice(1)
  }

  // If it's relative but missing a leading slash, add it
  if (!/^https?:\/\//i.test(dest) && !dest.startsWith('/')) {
    dest = `/${dest}`
  }

  return dest
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/:path*',
} 