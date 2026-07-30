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
  "min-h-[44px] flex items-center justify-center btn primary-btn shadow-button !rounded-10 uppercase font-oswald font-semibold text-skin-white text-title-2 md:text-title-1 !py-3 !px-4 text-center whitespace-nowrap transition-opacity hover:opacity-90";

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

  const relatedLinks: RelatedLink[] = [...(response.data?.related_links ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  if (relatedLinks.length === 0) return null;

  const count = relatedLinks.length;
  /** ≤2: equal full-width buttons. 3–4: scroll on mobile, equal grid on desktop. >4: 4 visible + scroll. */
  const fillWidth = count <= 2;
  const scrollAlways = count > 4;

  const rowClass = fillWidth
    ? `grid gap-2 md:gap-3 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`
    : scrollAlways
      ? "flex flex-nowrap gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory md:gap-3"
      : `flex flex-nowrap gap-2 overflow-x-auto scrollbar-none sm:overflow-visible sm:grid sm:gap-3 ${
          count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"
        }`;

  // >4: each button = 1/4 of track (minus 3 gaps) so exactly 4 fill the viewport
  const linkClass = fillWidth
    ? `w-full ${linkBaseClass}`
    : scrollAlways
      ? `w-[calc((100%-1.5rem)/4)] shrink-0 grow-0 snap-start md:w-[calc((100%-2.25rem)/4)] ${linkBaseClass}`
      : `shrink-0 sm:w-full sm:shrink ${linkBaseClass}`;

  return (
    <div className="mt-4 rounded-2xl border border-skin-neutral-100 bg-skin-neutral-50 p-3 shadow-card">
      <div className={rowClass}>
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
