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
  <li className="min-w-0 flex-1 rounded border border-white/20 bg-[#052a1f] px-2.5 py-2 text-center sm:min-w-[120px] sm:px-3.5 sm:py-2.5">
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
      <div className="mx-auto flex max-w-[1520px] flex-col gap-5 px-4 py-6 sm:gap-6 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-9 lg:gap-14">
        <div className="max-w-md shrink-0">
          <h2 className="!font-opensans text-title-1 font-semibold text-skin-white md:text-h5">
            {SITEWIDE_TRUST_STRIP.heading}
          </h2>
          <p className="mt-2 text-content-1 leading-[150%] text-skin-neutral-100 md:text-title-2">
            {SITEWIDE_TRUST_STRIP.subtext}
          </p>
        </div>

        <ul className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5 md:max-w-[760px] md:flex-nowrap md:justify-end">
          {badges.map((badge) => (
            <TrustBadge key={badge.category} category={badge.category} value={badge.value} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SitewideTrustStrip;
