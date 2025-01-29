import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import BlogsSlider from "@/components/BlogsSlider";

interface BlogsSectionProps {
  title?: string;
  viewAllHref?: string;
}

const BlogsSection: React.FC<BlogsSectionProps> = ({
  title = "New to Vaping",
  viewAllHref = "#",
}) => {
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <BlogsSlider />
      </div>
    </section>
  );
};

export default BlogsSection;
