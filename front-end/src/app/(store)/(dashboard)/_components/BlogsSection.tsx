import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import BlogsSlider from "@/components/BlogsSlider";
import { BlogResponse } from "@/lib/config/global.config";

interface BlogsSectionProps {
  title?: string;
  viewAllHref?: string;
  blogs: BlogResponse[];
}

const BlogsSection: React.FC<BlogsSectionProps> = ({
  title = "New to Vaping",
  viewAllHref = "/blogs",
  blogs
}) => {
  if (!blogs?.length) {
    return <p>No blogs available</p>;
  }
  
  return (
    <section className="space-y-4.5 md:space-y-7.5 mb-10">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider blogs-slider">
        <BlogsSlider data={blogs}/>
      </div>
    </section>
  );
};

export default BlogsSection;
