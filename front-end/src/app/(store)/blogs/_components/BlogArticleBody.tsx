import { BlogBodySegment } from "@/lib/blog-content.utils";
import BlogIndustryQuote from "./BlogIndustryQuote";
import BlogPromoBanner from "./BlogPromoBanner";
import BlogWarehouseCallout from "./BlogWarehouseCallout";

interface BlogArticleBodyProps {
  segments: BlogBodySegment[];
}

const BlogArticleBody = ({ segments }: BlogArticleBodyProps) => (
  <div className="blog-details flex w-full min-w-0 max-w-full flex-col gap-6">
    {segments.map((segment, index) => {
      if (segment.type === "warehouse-callout") {
        return (
          <BlogWarehouseCallout
            key={`callout-${index}`}
            label={segment.label}
            title={segment.title}
            bodyHtml={segment.bodyHtml}
          />
        );
      }

      if (segment.type === "industry-quote") {
        return (
          <BlogIndustryQuote
            key={`quote-${index}`}
            quote={segment.quote}
            attribution={segment.attribution}
          />
        );
      }

      if (segment.type === "promo-banner") {
        return (
          <BlogPromoBanner
            key={`promo-${index}`}
            badge={segment.badge}
            title={segment.title}
            description={segment.description}
            buttonLabel={segment.buttonLabel}
            buttonHref={segment.buttonHref}
            imageUrl={segment.imageUrl}
            imageAlt={segment.imageAlt}
          />
        );
      }

      return (
        <div
          key={`html-${index}`}
          className="ck-content rich-text min-w-0 max-w-full"
          dangerouslySetInnerHTML={{ __html: segment.content }}
        />
      );
    })}
  </div>
);

export default BlogArticleBody;
