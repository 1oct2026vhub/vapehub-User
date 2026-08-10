import { ServerActionStatus } from "@/lib/config/app.config";
import {
  SITEWIDE_TRUST_BADGES,
  SITEWIDE_TRUST_STRIP,
} from "@/lib/config/blog-trust-strip.config";
import { getTrustpilotReviews } from "@/lib/server.actions";

const TrustBadge = ({
  category,
  value,
}: {
  category: string;
  value: string;
}) => (
  <li className="min-w-0 rounded border border-white/20 bg-[#052a1f] px-2.5 py-2 text-center sm:px-3 sm:py-2.5 lg:min-w-[110px] lg:flex-1 xl:min-w-[120px] xl:px-3.5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#FFB400]">
      {category}
    </p>
    <p className="mt-1 text-[13px] font-semibold leading-tight text-skin-white sm:text-sm">
      {value}
    </p>
  </li>
);

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
      <div className="mx-auto flex max-w-[1520px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-10 md:py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-14">
        <div className="max-w-md shrink-0 lg:max-w-xs xl:max-w-md">
          <h2 className="!font-opensans text-title-1 font-semibold text-skin-white md:text-h5">
            {SITEWIDE_TRUST_STRIP.heading}
          </h2>
          <p className="mt-2 text-content-1 leading-[150%] text-skin-neutral-100 md:text-title-2">
            {SITEWIDE_TRUST_STRIP.subtext}
          </p>
        </div>

        <ul className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-2.5 lg:flex lg:max-w-[min(100%,760px)] lg:flex-wrap lg:justify-end xl:flex-nowrap">
          {badges.map((badge) => (
            <TrustBadge key={badge.category} category={badge.category} value={badge.value} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SitewideTrustStrip;
