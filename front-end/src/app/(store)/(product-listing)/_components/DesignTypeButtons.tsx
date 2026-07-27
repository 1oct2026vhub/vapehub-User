import Link from "next/link";
import { ServerActionStatus } from "@/lib/config/app.config";
import { RelatedLink } from "@/lib/config/category.config";
import { getCategoryRelatedCategories } from "@/lib/server.actions";

type DesignTypeButtonsProps = {
  slug: string;
};

function toHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "/";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const linkBaseClass =
  "min-h-[44px] flex items-center justify-center btn primary-btn shadow-button !rounded-10 uppercase font-oswald font-semibold text-skin-white text-title-2 md:text-title-1 !py-3 !px-4 text-center whitespace-nowrap transition-opacity hover:opacity-90";

const DesignTypeButtons = async ({ slug }: DesignTypeButtonsProps) => {
  const categorySlug = slug.trim().split("/").filter(Boolean).pop() ?? "";
  if (!categorySlug) return null;

  const response = await getCategoryRelatedCategories(categorySlug);
  if (response.status !== ServerActionStatus.SUCCESS) return null;

  const relatedLinks: RelatedLink[] = [...(response.data?.related_links ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  if (relatedLinks.length === 0) return null;

  const count = relatedLinks.length;
  /** ≤2: equal full-width buttons. 3–4: scroll on mobile, equal grid on desktop. >4: scroll always. */
  const fillWidth = count <= 2;
  const scrollAlways = count > 4;

  const rowClass = fillWidth
    ? `grid gap-2 md:gap-3 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`
    : scrollAlways
      ? "flex flex-nowrap gap-2 md:gap-3 overflow-x-auto scrollbar-none"
      : `flex flex-nowrap gap-2 overflow-x-auto scrollbar-none sm:overflow-visible sm:grid sm:gap-3 ${
          count === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"
        }`;

  const linkClass = fillWidth
    ? `w-full ${linkBaseClass}`
    : scrollAlways
      ? `shrink-0 ${linkBaseClass}`
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
