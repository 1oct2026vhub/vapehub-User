import BreadCrumbs from "@/components/BreadCrumbs";
import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";

interface CategoryBlogsProps {
  data: BlogByCategoryAndSlugResponse;
}

const CategoryBlogs = ({ data }: CategoryBlogsProps) => {
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS },
        { label: data.categories?.[0]?.name, href: data.categories?.[0]?.slug },
        { label: data.title, href: data.slug, isActive: true },
      ];

  return (
    <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
    <BreadCrumbs items={breadcrumbs} />
    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>{data.categories?.[0]?.name ?? "Blogs"}</h1>
         <div dangerouslySetInnerHTML={{ __html: data.content }} />
         
    </main>
  );
};

export default CategoryBlogs;