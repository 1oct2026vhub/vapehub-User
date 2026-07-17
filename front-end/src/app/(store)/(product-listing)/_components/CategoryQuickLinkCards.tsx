import Link from "next/link";
import NoImage from "@/components/NoImage";
import { DownArrowIcon } from "@/components/Icons";
import { ServerActionStatus } from "@/lib/config/app.config";
import { RelatedCategory } from "@/lib/config/category.config";
import { getCategoryRelatedCategories } from "@/lib/server.actions";

type CategoryQuickLinkCardsProps = {
  slug: string;
};

function toCategoryHref(slug: string): string {
  const trimmed = slug.trim().replace(/^\/+/, "");
  return trimmed ? `/${trimmed}` : "/";
}

const CategoryQuickLinkCards = async ({ slug }: CategoryQuickLinkCardsProps) => {
  const categorySlug = slug.trim().split("/").filter(Boolean).pop() ?? "";
  if (!categorySlug) return null;

  const response = await getCategoryRelatedCategories(categorySlug);
  if (response.status !== ServerActionStatus.SUCCESS) return null;

  const relatedCategories: RelatedCategory[] =
    response.data?.related_categories ?? [];

  if (relatedCategories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {relatedCategories.map((item) => (
        <Link
          key={item.id}
          href={toCategoryHref(item.slug)}
          prefetch={false}
          className="flex min-h-[72px] items-center gap-3 rounded-lg border border-skin-neutral-100 bg-skin-white p-3 shadow-card transition-shadow hover:shadow-brand-card sm:gap-3.5 sm:p-3.5"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-skin-neutral-25 sm:h-14 sm:w-14">
            <NoImage
              src={item.logo_url ?? ""}
              alt={item.alt_text?.trim() || item.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="min-w-0 flex-1 font-oswald text-content-1 font-semibold text-skin-neutral-500 sm:text-title-2">
            {item.name}
          </span>
          <DownArrowIcon
            className="h-4 w-4 shrink-0 -rotate-90 text-skin-neutral-200"
            aria-hidden
          />
        </Link>
      ))}
    </div>
  );
};

export default CategoryQuickLinkCards;
