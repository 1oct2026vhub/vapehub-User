import Link from "next/link";
import NoImage from "@/components/NoImage";
import { DownArrowIcon } from "@/components/Icons";

type CategoryQuickLink = {
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const STATIC_CATEGORY_QUICK_LINKS: CategoryQuickLink[] = [
  {
    title: "Hayati Pod Kits",
    href: "/hayati-pod-kits",
    imageSrc: "",
    imageAlt: "Hayati Pod Kits",
  },
  {
    title: "Hayati Prefilled Pods & Refills",
    href: "/hayati-prefilled-pods-refills",
    imageSrc: "",
    imageAlt: "Hayati Prefilled Pods & Refills",
  },
  {
    title: "Hayati Refillable Pods",
    href: "/hayati-refillable-pods",
    imageSrc: "",
    imageAlt: "Hayati Refillable Pods",
  },
];

const CategoryQuickLinkCards = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
    {STATIC_CATEGORY_QUICK_LINKS.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        prefetch={false}
        className="flex min-h-[72px] items-center gap-3 rounded-lg border border-skin-neutral-100 bg-skin-white p-3 shadow-card transition-shadow hover:shadow-brand-card sm:gap-3.5 sm:p-3.5"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-skin-neutral-25 sm:h-14 sm:w-14">
          <NoImage
            src={item.imageSrc}
            alt={item.imageAlt}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="min-w-0 flex-1 font-oswald text-content-1 font-semibold text-skin-neutral-500 sm:text-title-2">
          {item.title}
        </span>
        <DownArrowIcon
          className="h-4 w-4 shrink-0 -rotate-90 text-skin-neutral-200"
          aria-hidden
        />
      </Link>
    ))}
  </div>
);

export default CategoryQuickLinkCards;
