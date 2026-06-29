import React from "react";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import { AsyncReactElement } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import {
  RelatedGuidesRenderProps,
  resolveRelatedGuidesGuides,
} from "./related-guides.utils";

const RelatedGuides: React.FC<RelatedGuidesRenderProps> = async ({
  title = "Related Guides",
  viewAllHref = ROUTES.BLOGS,
  currentProductId,
  currentCategoryId,
}): AsyncReactElement => {
  const guides = await resolveRelatedGuidesGuides({
    currentProductId,
    currentCategoryId,
  });

  if (!guides.length) {
    return <></>;
  }

  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <BlogCard key={guide.id} blog={guide} />
        ))}
      </div>
    </section>
  );
};

export default RelatedGuides;
