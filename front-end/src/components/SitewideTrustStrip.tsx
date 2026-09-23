import {
  SITEWIDE_TRUST_BADGES,
  SITEWIDE_TRUST_STRIP,
  type SitewideTrustBadge,
} from "@/lib/config/blog-trust-strip.config";
import TrustStripCarousel from "@/components/TrustStripCarousel";
import type { FooterBadge, FooterMenuResponse } from "@/lib/config/header.config";

function resolveBadgeHref(url?: string | null): string | null {
  const value = url?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function mapCmsBadges(badges: FooterBadge[]): SitewideTrustBadge[] {
  return [...badges]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((badge) => badge.heading && badge.subtitle)
    .map((badge) => ({
      id: badge.id,
      category: badge.subtitle,
      value: badge.heading,
      iconUrl: badge.icon_url,
      href: resolveBadgeHref(badge.url),
    }));
}

interface SitewideTrustStripProps {
  footerMenu: FooterMenuResponse;
}

const SitewideTrustStrip = ({ footerMenu: footerResponse }: SitewideTrustStripProps) => {
  const cmsBadges = mapCmsBadges(footerResponse.badges || []);
  const badges = cmsBadges.length > 0 ? cmsBadges : SITEWIDE_TRUST_BADGES;

  return (
    <section
      aria-label="Accreditations and trust signals"
      className="trust-strip mt-7"
    >
      <div className="mx-auto max-w-[1520px] px-4 py-7 sm:px-6 sm:py-8 md:px-10 md:py-9">
        <div className="mb-5 max-w-2xl md:mb-6">
          <h2 className="text-h5 font-semibold !font-oswald text-skin-white md:text-h3">
            {SITEWIDE_TRUST_STRIP.heading}
          </h2>
          <p className="mt-1.5 text-content-1 leading-[150%] text-skin-neutral-100 md:text-title-2">
            {SITEWIDE_TRUST_STRIP.subtext}
          </p>
        </div>

        <div className="slider-container section-slider trust-strip-slider">
          <TrustStripCarousel badges={badges} />
        </div>
      </div>
    </section>
  );
};

export default SitewideTrustStrip;
