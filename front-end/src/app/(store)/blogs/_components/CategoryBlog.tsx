import BreadCrumbs from "@/components/BreadCrumbs";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import Image from "next/image";

interface CategoryBlogsProps {
  data: BlogByCategoryAndSlugResponse;
}

const CategoryBlogs = ({ data }: CategoryBlogsProps) => {
  if (!data) {
    return <EmptyPlaceholder title='Uh, oh!' description='No blogs found' />
  }
  const breadcrumbs = [ 
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Blogs", href: ROUTES.BLOGS },
    { label: data.categories?.[0]?.name, href: data.categories?.[0]?.slug },
    { label: data.title, href: data.slug, isActive: true },
  ];

  return (
    <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
      <BreadCrumbs items={breadcrumbs} />
      <Image
        src={data.image_url ?? '/images/blog-list-card.jpg'}
        alt={data.title ?? 'Blog Image'}
        width={0}
        height={0}
        sizes="100vw"
        className='rounded-10 w-full max-h-80'
        priority
      />
      <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>{data.title ?? "Blogs"}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.content }} />

    </main>
  );
};

export default CategoryBlogs;