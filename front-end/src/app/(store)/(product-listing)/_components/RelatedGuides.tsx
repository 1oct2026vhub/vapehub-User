import React from "react";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import { AsyncReactElement } from "@/lib/config/app.config";
import { BlogList } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import {
  RelatedGuidesRenderProps,
  resolveRelatedGuidesGuides,
} from "./related-guides.utils";

type RelatedGuidesProps = RelatedGuidesRenderProps & {
  /** When provided (e.g. from buying-guide API), skip secondary fetches. */
  guides?: BlogList[];
};

const RelatedGuides: React.FC<RelatedGuidesProps> = async ({
  title = "Related Guides",
  viewAllHref = ROUTES.BLOGS,
  currentProductId,
  currentCategoryId,
  embedded = false,
  guides: prefetchedGuides,
}): AsyncReactElement => {
  const guides =
    prefetchedGuides ??
    (await resolveRelatedGuidesGuides({
      currentProductId,
      currentCategoryId,
    }));

  if (!guides.length) {
    return <></>;
  }

  return (
    <section className={embedded ? "w-full pt-4 md:pt-5" : "w-full"}>
      {embedded ? (
        <div className="mb-4 h-px w-full bg-skin-neutral-200 md:mb-5" aria-hidden />
      ) : null}
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading title={title} />
          <ViewAllLink href={viewAllHref} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <BlogCard key={guide.id} blog={guide} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedGuides;
