import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import BlogsSlider from "@/components/BlogsSlider";
import { getBlogList } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";

interface BlogsSectionProps {
  title?: string;
  viewAllHref?: string;
}

const BlogsSection: React.FC<BlogsSectionProps> = async ({
  title = "New to Vaping",
  viewAllHref = "/blogs",
}): AsyncReactElement => {
  const response = await getBlogList("");
      if (response.status == ServerActionStatus.ERROR) {
          return (<p>{response.message}</p>);
      } 
  
  return (
    <section className="space-y-4.5 md:space-y-7.5 mb-10">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider blogs-slider">
        <BlogsSlider data={response.data}/>
      </div>
    </section>
  );
};

export default BlogsSection;
