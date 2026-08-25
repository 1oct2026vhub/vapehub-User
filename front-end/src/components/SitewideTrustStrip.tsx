import { ServerActionStatus } from "@/lib/config/app.config";
import {
  SITEWIDE_TRUST_BADGES,
  SITEWIDE_TRUST_STRIP,
} from "@/lib/config/blog-trust-strip.config";
import { getTrustpilotReviews } from "@/lib/server.actions";
import TrustStripCarousel from "@/components/TrustStripCarousel";

const SitewideTrustStrip = async () => {
  const trustResponse = await getTrustpilotReviews();
  const trustStars =
    trustResponse.status === ServerActionStatus.SUCCESS
      ? trustResponse.data?.overallStats?.scoreBreakdown?.stars ?? 4.8
      : 4.8;

  const badges = SITEWIDE_TRUST_BADGES.map((badge) =>
    badge.category === "REVIEWS"
      ? { ...badge, value: `Trustpilot ${trustStars.toFixed(1)}★` }
      : badge,
  );

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
