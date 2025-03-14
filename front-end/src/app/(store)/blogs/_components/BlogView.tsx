import BreadCrumbs from "@/components/BreadCrumbs";
import { BlogBySlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import Subscription from "../../(dashboard)/_components/Subscription";
import Image from "next/image";

interface BlogViewProps {
  data: BlogBySlugResponse;
}

const BlogView = ({ data }: BlogViewProps) => {
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS },
        { label: data.name, href: data.slug, isActive: true },
      ];

  return (
    <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
    <BreadCrumbs items={breadcrumbs} />
    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Blogs</h1>
    <section className="w-full flex flex-col gap-6 md:gap-8.5 blog-details">
        {
            data.blogs.map((blog) => (
                <div key={blog.id}>
                    <Image
                        src={blog.image_url}
                        alt={blog.title}
                        width={1340}
                        height={318}
                        className='rounded-10 w-full max-h-80 min-h-80'
                    />
                    <div className='space-y-3.5 md:space-y-6'>
                        <h2 className='primary-gradient-600 text-h5 md:text-38 font-bold lg:max-w-[60%]'>{blog.title}</h2>
                        {/* <p>{data.description}</p> */}
                        </div>
                        <div className='space-y-3.5 md:space-y-6'>
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </div>
                </div>
                 
            ))
        }
      
        <Subscription />
    </section>
</main>
  );
};

export default BlogView;