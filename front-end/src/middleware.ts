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

// First path segment = known app route. Never run slug-relation or rewrite these to 404.
const KNOWN_FIRST_SEGMENTS = new Set([
  'shop', 'new-products', 'checkout', 'contact', 'delivery-information', 'faq',
  'loyalty-points', 'privacy-policy', 'returns-policy', 'terms-conditions',
  'shopping-cart', 'social-media', 'payment-failed', 'payment-success',
  'blogs', 'page-not-found', 'vapehub-deals', 'brands', 'order-details',
  'refer-a-friend', 'my-account','brand','product-deals',
])

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

  // Slug-relation: 301 when redirect:true; rewrite to /page-not-found when slug missing (avoids notFound() hook error).
  // Known routes (shop, contact, etc.) are never checked so they never get wrongly 404'd.
  let response: NextResponse
  const slugResult = await resolveSlugResult(request)
  if (slugResult.type === 'redirect' && slugResult.url) {
    // Use 301 as required, but add explicit no-cache headers so browsers and intermediaries
    // do not cache the redirect mapping permanently. This prevents stale 301 mappings.
    response = NextResponse.redirect(slugResult.url, 301)
    // Strong cache prevention for clients and proxies
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    // For some CDNs / reverse proxies
    response.headers.set('Surrogate-Control', 'no-store')
  } else if (slugResult.type === 'not-found') {
    response = NextResponse.rewrite(new URL('/page-not-found', request.url))
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

type SlugResult = { type: 'next' } | { type: 'redirect'; url: URL } | { type: 'not-found' }

async function resolveSlugResult(request: NextRequest): Promise<SlugResult> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return { type: 'next' }

  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)
  const primarySlug = segments[0]
  if (!primarySlug) return { type: 'next' }

  // Quick guard for protected routes / auth pages
  if (
    protectedRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith(ROUTES.MY_ACCOUNT) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return { type: 'next' }
  }

  // If the path has more than 2 segments it's out of scope for slug-relation
  if (segments.length > 2) return { type: 'next' }

  // Helper: call slug-relation API for a given slug and return a SlugResult
  async function fetchSlugRelation(slugToCheck: string): Promise<SlugResult> {
    try {
      const endpoint = API_ROUTES.GET_DYNAMIC_PAGE_SLUG(slugToCheck)
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      const json = (await res.json()) as {
        success?: boolean
        status?: string
        data?: { redirect?: boolean; redirect_url?: string }
      }
      // Log slug-relation responses to help debug 404 -> application error scenarios
      try {
        console.log(`slug-relation(${slugToCheck}) ->`, JSON.stringify(json))
      } catch {
        console.log(`slug-relation(${slugToCheck}) -> (non-serializable)`, json)
      }
      const isError = !res.ok || json.status === 'ERROR' || json.success === false
      if (isError) return { type: 'not-found' }

      if (json?.data?.redirect && json.data.redirect_url) {
        const normalized = normalizeRedirectUrl(json.data.redirect_url)
        if (normalized && normalized !== pathname) {
          const url = /^https?:\/\//i.test(normalized) ? new URL(normalized) : new URL(normalized, request.url)
          return { type: 'redirect', url }
        }
      }
      return { type: 'next' }
    } catch {
      return { type: 'next' }
    }
  }

  // Special-case known routes that need to be checked before the KNOWN_FIRST_SEGMENTS guard
  // (brand and product-deals must run even though 'brand' / 'product-deals' are in KNOWN_FIRST_SEGMENTS)
  if (pathname.startsWith('/brand/') && segments.length === 2) {
    return await fetchSlugRelation(segments[1])
  }
  if (pathname.startsWith('/product-deals/') && segments.length === 2) {
    return await fetchSlugRelation(segments[1])
  }

  // Never run slug-relation for known app routes – avoids wrong 404s on /shop, /contact, etc.
  if (KNOWN_FIRST_SEGMENTS.has(primarySlug)) return { type: 'next' }

  // Default: check the primary slug (product, category, blog, etc.)
  return await fetchSlugRelation(primarySlug)
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