interface BlogTrustSidebarProps {
  stars: number;
  totalReviews: number;
}

const TRUST_FEATURES = [
  "TPD-compliant stock",
  "Age-verified at checkout",
  "Same-day UK dispatch",
] as const;

const TRUST_BADGES = ["UKVIA", "MHRA", "Trustpilot"] as const;

const GoldStar = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="#FFB400"
    aria-hidden
    className="shrink-0"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const BlogTrustSidebar = ({ stars, totalReviews }: BlogTrustSidebarProps) => (
  <aside className="w-full max-w-full min-w-0 rounded-xl border border-skin-neutral-100 bg-skin-white p-4 text-left sm:p-5">
    <p className="text-content-2 font-bold uppercase tracking-wide text-skin-primary-500">
      Why UK vapers trust us
    </p>

    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex shrink-0 gap-[1px]" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <GoldStar key={index} />
          ))}
        </div>
        <p className="text-[13.5px] leading-[140%] text-skin-neutral-400">
          {stars.toFixed(1)} / 5 across {totalReviews.toLocaleString("en-GB")}+
        </p>
      </div>
      <p className="mt-0.5 text-[13.5px] leading-[140%] text-skin-neutral-400">Trustpilot reviews</p>
    </div>

    <ul className="mt-3 space-y-1 sm:hidden">
      {TRUST_FEATURES.map((feature) => (
        <li key={feature} className="text-[13.5px] leading-[140%] text-skin-neutral-400">
          {feature}
        </li>
      ))}
    </ul>
    <p className="mt-3 hidden text-[13.5px] leading-[140%] text-skin-neutral-400 sm:block">
      {TRUST_FEATURES.join(" · ")}
    </p>

    <div className="mt-4 flex flex-wrap items-start gap-1.5">
      {TRUST_BADGES.map((badge) => (
        <span
          key={badge}
          className="rounded-full border border-skin-primary-500 bg-[#f0f9f9] px-2.5 py-0.5 text-[11.5px] font-bold uppercase text-skin-primary-500"
        >
          {badge}
        </span>
      ))}
    </div>
  </aside>
);

export default BlogTrustSidebar;
