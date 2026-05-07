import { toAbsoluteUrl } from "@/lib/seo-schema";
import type { CarouselConfig } from "@/lib/config/carousel.config";

function stripTrailingSlash(s: string): string {
  return s.replace(/\/$/, "");
}

/**
 * Resolve carousel image src to an absolute URL.
 *
 * - Absolute `http(s):` and `//` URLs are kept (protocol-relative upgraded to https).
 * - Relative paths: `/uploads/`, `/media/`, `/wp-content/` → storefront or `NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL` (CDN),
 *   not the API origin (those files are rarely served from api.*).
 * - `/storage/` and API-ish paths → API base.
 * - Use `normalizeCarouselBanners` in HomeCarousel so server-side env (`NEXTAUTH_URL`, etc.) resolves paths before the client.
 * - If no env base can resolve a relative path, returns `fallback` (default local placeholder). No hardcoded API host.
 */
export function resolveCarouselImageUrl(
  src: string | undefined | null,
  fallback = "/images/blog-card.jpg"
): string {
  const t = (src ?? "").trim();
  if (!t) return fallback;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;

  const apiBase = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL)
    : "";

  const assetOverride = process.env.NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL)
    : "";

  const siteBaseRaw =
    process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL || "";
  const siteBase = siteBaseRaw ? stripTrailingSlash(siteBaseRaw) : "";

  const pathForMatch = t.startsWith("/") ? t : `/${t}`;

  /** CMS uploads are usually on the public site or a CDN (e.g. S3), not on api.host. */
  const looksLikeSiteOrCdnMedia =
    /^\/(?:uploads|media|wp-content)\b/i.test(pathForMatch) ||
    /^(?:uploads|media|wp-content)\b/i.test(t);

  if (looksLikeSiteOrCdnMedia) {
    if (assetOverride) return toAbsoluteUrl(assetOverride, t);
    if (siteBase) return toAbsoluteUrl(siteBase, t);
    if (apiBase) return toAbsoluteUrl(apiBase, t);
    return fallback;
  }

  const preferApi =
    /\/(?:storage)\b|^storage\/?/i.test(pathForMatch) || /\b\/api\//i.test(pathForMatch);

  if (preferApi && apiBase) {
    return toAbsoluteUrl(apiBase, t);
  }

  if (assetOverride) return toAbsoluteUrl(assetOverride, t);
  if (siteBase) return toAbsoluteUrl(siteBase, t);
  if (apiBase) return toAbsoluteUrl(apiBase, t);
  return fallback;
}

/** Run in a Server Component so `NEXTAUTH_URL` is applied and URLs are absolute before client hydration. */
export function normalizeCarouselBanners(banners: CarouselConfig[]): CarouselConfig[] {
  return banners.map((b) => ({
    ...b,
    image_url: resolveCarouselImageUrl(b.image_url),
    image_url_mid: resolveCarouselImageUrl(b.image_url_mid || b.image_url),
    image_url_low: resolveCarouselImageUrl(b.image_url_low || b.image_url),
  }));
}
