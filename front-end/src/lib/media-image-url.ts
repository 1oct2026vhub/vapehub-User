import { toAbsoluteUrl } from "@/lib/seo-schema";

function stripTrailingSlash(s: string): string {
  return s.replace(/\/$/, "");
}

/**
 * Resolve generic product/media image URLs used by UI components.
 * Keeps app static assets local and resolves CMS/media paths using env bases.
 */
export function resolveMediaImageUrl(src?: string | null): string | null {
  const t = (src ?? "").trim();
  if (!t) return null;

  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("data:") || t.startsWith("blob:")) return t;

  // Keep local app assets untouched.
  if (t.startsWith("/images/") || t.startsWith("/icons/")) return t;

  const apiBase = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL)
    : "";
  const assetOverride = process.env.NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_CAROUSEL_ASSET_BASE_URL)
    : "";
  const siteBase = process.env.NEXT_PUBLIC_AUTH_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_AUTH_URL)
    : "";

  const pathForMatch = t.startsWith("/") ? t : `/${t}`;

  const looksLikeSiteMedia =
    /^\/(?:uploads|media|wp-content)\b/i.test(pathForMatch) ||
    /^(?:uploads|media|wp-content)\b/i.test(t);
  if (looksLikeSiteMedia) {
    if (assetOverride) return toAbsoluteUrl(assetOverride, t);
    if (siteBase) return toAbsoluteUrl(siteBase, t);
    if (apiBase) return toAbsoluteUrl(apiBase, t);
    return t.startsWith("/") ? t : `/${t}`;
  }

  const preferApi =
    /^\/?(?:storage)\b/i.test(pathForMatch) || /\b\/api\//i.test(pathForMatch);
  if (preferApi) {
    if (apiBase) return toAbsoluteUrl(apiBase, t);
    if (siteBase) return toAbsoluteUrl(siteBase, t);
    return t.startsWith("/") ? t : `/${t}`;
  }

  if (t.startsWith("/")) return t;
  if (assetOverride) return toAbsoluteUrl(assetOverride, t);
  if (siteBase) return toAbsoluteUrl(siteBase, t);
  if (apiBase) return toAbsoluteUrl(apiBase, t);
  return t;
}
