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

const DesignTypeButtons = async ({ slug }: DesignTypeButtonsProps) => {
  const categorySlug = slug.trim().split("/").filter(Boolean).pop() ?? "";
  if (!categorySlug) return null;

  const response = await getCategoryRelatedCategories(categorySlug);
  if (response.status !== ServerActionStatus.SUCCESS) return null;

  const relatedLinks: RelatedLink[] = [...(response.data?.related_links ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  if (relatedLinks.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-skin-neutral-100 bg-skin-neutral-50 p-3 shadow-card">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        {relatedLinks.map((link) => {
          const href = toHref(link.url);
          return (
            <Link
              key={`${link.text}-${href}`}
              href={href}
              prefetch={false}
              className="w-full min-h-[44px] flex items-center justify-center btn primary-btn shadow-button !rounded-10 uppercase font-oswald font-semibold text-skin-white text-title-2 md:text-title-1 !py-3 !px-4 text-center transition-opacity hover:opacity-90"
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
