import Link from "next/link";
import { ServerActionStatus } from "@/lib/config/app.config";
import { RelatedLink } from "@/lib/config/category.config";
import {
  getBrandRelatedBrands,
  getCategoryRelatedCategories,
} from "@/lib/server.actions";

export type RelatedQuickLinksEntity = "category" | "brand";

type DesignTypeButtonsProps = {
  slug: string;
  /** Defaults to category related-categories API. */
  entity?: RelatedQuickLinksEntity;
};

function toHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "/";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const linkBaseClass =
  "box-border flex min-h-[44px] items-center justify-center overflow-hidden btn primary-btn shadow-button !rounded-10 uppercase font-oswald font-semibold text-skin-white text-content-2 sm:text-title-2 md:text-title-1 !py-3 !px-3 sm:!px-4 text-center leading-snug whitespace-normal sm:whitespace-nowrap transition-opacity hover:opacity-90";

const DesignTypeButtons = async ({
  slug,
  entity = "category",
}: DesignTypeButtonsProps) => {
  const leafSlug = slug.trim().split("/").filter(Boolean).pop() ?? "";
  if (!leafSlug) return null;

  const response =
    entity === "brand"
      ? await getBrandRelatedBrands(leafSlug)
      : await getCategoryRelatedCategories(leafSlug);
  if (response.status !== ServerActionStatus.SUCCESS) return null;

  // Hide related links unless buyingGuide.is_enabled is explicitly true
  if (response.data?.buyingGuide?.is_enabled !== true) return null;

  const relatedLinks: RelatedLink[] = [...(response.data?.related_links ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  if (relatedLinks.length === 0) return null;

  const count = relatedLinks.length;
  /** ≤2: equal full-width. ≥3 mobile: swipe carousel. Desktop: grid (3–4) or 4-up scroll (>4). */
  const fillWidth = count <= 2;
  const scrollDesktop = count > 4;

  const rowClass = fillWidth
    ? `grid gap-2 md:gap-3 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`
    : [
        "flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory",
        scrollDesktop ? "md:gap-3" : "md:grid md:overflow-visible md:snap-none md:gap-3",
        !scrollDesktop && count === 3 ? "md:grid-cols-3" : "",
        !scrollDesktop && count === 4 ? "md:grid-cols-4" : "",
      ]
        .filter(Boolean)
        .join(" ");

  // Mobile: ~85% width so one button reads clearly and the next peeks for scroll.
  // Desktop >4: exactly 4 fill the row; 3–4: stretch in the grid.
  const linkClass = fillWidth
    ? `w-full ${linkBaseClass}`
    : [
        "shrink-0 grow-0 snap-start",
        "w-[min(85%,18rem)]",
        scrollDesktop
          ? "md:w-[calc((100%-2.25rem)/4)] md:min-w-0"
          : "md:w-full md:min-w-0 md:snap-align-none",
        linkBaseClass,
      ].join(" ");

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-skin-neutral-100 bg-skin-neutral-50 p-3 shadow-card">
      <div className={`min-w-0 ${rowClass}`}>
        {relatedLinks.map((link) => {
          const href = toHref(link.url);
          return (
            <Link
              key={`${link.text}-${href}`}
              href={href}
              prefetch={false}
              className={linkClass}
            >
              {link.text}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DesignTypeButtons;
