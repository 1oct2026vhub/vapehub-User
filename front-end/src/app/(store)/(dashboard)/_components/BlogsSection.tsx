import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import BlogsSlider from "@/components/BlogsSlider"; 
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getBlogList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

interface BlogsSectionProps {
  title?: string;
  viewAllHref?: string;
}

const BlogsSection: React.FC<BlogsSectionProps> = async ({
  title = "New to Vaping",
  viewAllHref = "/blogs",
}) => {
  const blogsResponse = await getBlogList('', { show_home_page: true });
  if (blogsResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load blogs' />;
  }
  const blogs = blogsResponse.data ?? [];
  if (!blogs.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No blogs available' />;
  }
  
  return (
    <section className="md:space-y-5">
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
