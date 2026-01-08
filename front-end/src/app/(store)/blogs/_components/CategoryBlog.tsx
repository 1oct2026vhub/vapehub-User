import BreadCrumbs from "@/components/BreadCrumbs";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";

interface CategoryBlogsProps {
  data: BlogByCategoryAndSlugResponse;
}

// Function to process HTML content and fix relative links
const processBlogContent = (html: string): string => {
  // Use regex to fix relative links in anchor tags
  return html.replace(/<a\s+([^>]*\s+)?href=["']([^"']+)["']([^>]*)>/gi, (match, before, href, after) => {
    // If href doesn't start with http://, https://, mailto:, tel:, #, or /, make it absolute
    if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#|\/)/)) {
      // Convert relative link to absolute by adding leading slash
      return `<a ${before || ''}href="/${href}"${after || ''}>`;
    }
    return match;
  });
};

const CategoryBlogs = ({ data }: CategoryBlogsProps) => {
  if (!data) {
    return <EmptyPlaceholder title='Uh, oh!' description='No blogs found' />
  }  
  const breadcrumbs = [ 
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Blogs", href: ROUTES.BLOGS },
    ...(data.categories?.[0]?.parent ? [
      { label: data.categories[0].parent.name, href: `/${data.categories[0].parent.slug}` },
      { label: data.categories?.[0]?.name, href: `/${data.categories[0].slug}` },  
    ] : [
      { label: data.categories?.[0]?.name, href: `/${data.categories[0]?.slug}` },
    ]),
    { label: data.title, href: data.slug.startsWith('/') ? data.slug : `/${data.slug}`, isActive: true },
  ];

  // Process blog content to fix relative links
  const processedContent = processBlogContent(data.content);

  return (
    <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
      <BreadCrumbs items={breadcrumbs} />
      <Image
        src={data.image_url ?? '/images/blog-list-card.jpg'}
        alt={data.alt_text ?? data.title}
        width={0}
        height={0}
        sizes="100vw"
        className='rounded-10 w-full max-h-80'
        priority
      />
      <h1 className='primary-gradient-600 text-h5 md:text-h3 font-semibold w-fit'>{data.title ?? "Blogs"}</h1>
      <div className="w-full blog-details rich-text" dangerouslySetInnerHTML={{ __html: processedContent }} />
    </main>
  );
};

export default CategoryBlogs;