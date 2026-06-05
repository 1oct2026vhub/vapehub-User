import { NextResponse, type NextRequest } from 'next/server'
import { resolvePublicSiteUrl } from '@/lib/site-url'

const PRERENDER_SERVICE_URL =
  process.env.PRERENDER_SERVICE_URL?.replace(/\/$/, '') ?? 'https://service.prerender.io'

/** Crawlers and preview bots served pre-rendered HTML from Prerender.io */
const PRERENDER_BOTS = [
  'googlebot',
  'yahoo! slurp',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot',
  'oai-searchbot',
  'chatgpt',
  'gptbot',
  'perplexity',
  'claudebot',
  'amazonbot',
  'integration-test',
] as const

const IGNORE_EXTENSIONS = new Set([
  '.js', '.css', '.xml', '.less', '.png', '.jpg', '.jpeg', '.gif', '.pdf',
  '.doc', '.txt', '.ico', '.rss', '.zip', '.mp3', '.rar', '.exe', '.wmv',
  '.avi', '.ppt', '.mpg', '.mpeg', '.tif', '.wav', '.mov', '.psd', '.ai',
  '.xls', '.mp4', '.m4a', '.swf', '.dat', '.dmg', '.iso', '.flv', '.m4v',
  '.torrent', '.woff', '.ttf', '.svg', '.webmanifest',
])

/** Storefront paths that should not be pre-rendered (auth, checkout, transactional). */
const EXCLUDED_PATH_PREFIXES = [
  '/api',
  '/checkout',
  '/shopping-cart',
  '/payment-success',
  '/payment-failed',
  '/my-account',
  '/login',
  '/register',
  '/order-details',
] as const

export function isPrerenderEnabled(): boolean {
  const token = process.env.PRERENDER_TOKEN?.trim()
  if (!token) return false
  if (process.env.PRERENDER_ENABLED === 'true') return true
  return process.env.NODE_ENV === 'production'
}

function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return PRERENDER_BOTS.some((bot) => ua.includes(bot.toLowerCase()))
}

function hasIgnoredExtension(pathname: string): boolean {
  const lastDot = pathname.lastIndexOf('.')
  if (lastDot <= 0) return false
  const ext = pathname.slice(lastDot).toLowerCase()
  return IGNORE_EXTENSIONS.has(ext)
}

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isLocalOrInternalHost(host: string): boolean {
  const hostname = host.toLowerCase().split(':')[0]
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  return /^(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(hostname)
}

function shouldProxyToPrerender(request: NextRequest): boolean {
  if (!isPrerenderEnabled()) return false
  if (request.method !== 'GET' && request.method !== 'HEAD') return false

  const pathname = request.nextUrl.pathname
  if (isExcludedPath(pathname)) return false
  if (hasIgnoredExtension(pathname)) return false

  // Prerender's own fetches include this header — avoid infinite loops.
  if (request.headers.get('X-Prerender')) return false

  const userAgent = request.headers.get('user-agent')
  const escapedFragment = request.nextUrl.searchParams.has('_escaped_fragment_')
  return isBotRequest(userAgent) || escapedFragment
}

/** Public URL Prerender should fetch (not raw request.url behind a proxy). */
function getPrerenderTargetUrl(request: NextRequest): string {
  const { pathname, search } = request.nextUrl
  const pathWithQuery = `${pathname}${search}`

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = request.headers.get('host')
  const publicHost = forwardedHost ?? host

  if (publicHost && !isLocalOrInternalHost(publicHost)) {
    const proto = forwardedProto ?? 'https'
    return `${proto}://${publicHost}${pathWithQuery}`
  }

  const siteUrl = resolvePublicSiteUrl()
  if (!siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1')) {
    return `${siteUrl}${pathWithQuery}`
  }

  return request.url
}

/**
 * Proxies bot traffic to Prerender.io and returns the rendered HTML response.
 * Returns null when the request should continue through normal middleware.
 */
export async function tryPrerenderResponse(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!shouldProxyToPrerender(request)) {
    return null
  }

  const token = process.env.PRERENDER_TOKEN?.trim()
  if (!token) return null

  const targetUrl = getPrerenderTargetUrl(request)
  const prerenderUrl = `${PRERENDER_SERVICE_URL}/${targetUrl}`

  try {
    const res = await fetch(
      new Request(prerenderUrl, {
        method: request.method,
        headers: {
          'X-Prerender-Token': token,
          'X-Prerender-Int-Type': 'NextJS',
        },
        redirect: 'manual',
      }),
    )

    const responseHeaders = new Headers(res.headers)
    responseHeaders.set('X-Redirected-From', targetUrl)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')
    responseHeaders.delete('transfer-encoding')

    const { readable, writable } = new TransformStream()
    if (res.body) {
      void res.body.pipeTo(writable)
    } else {
      void writable.close()
    }

    return new NextResponse(readable, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('PRERENDER ERROR:', error)
    return null
  }
}
