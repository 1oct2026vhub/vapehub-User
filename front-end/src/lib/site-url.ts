const LOCAL_FALLBACK_URL = "http://localhost:3000";

const normalizeUrl = (value?: string | null): string | null => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

export const resolveSiteUrl = (): string => {
  const candidates = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate);
    if (normalized) return normalized;
  }

  return LOCAL_FALLBACK_URL;
};

/** Public storefront URL for crawlers (prefers NEXT_PUBLIC_* over NEXTAUTH_URL). */
export const resolvePublicSiteUrl = (): string => {
  const candidates = [
    process.env.NEXT_PUBLIC_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate);
    if (normalized) return normalized;
  }

  return LOCAL_FALLBACK_URL;
};
