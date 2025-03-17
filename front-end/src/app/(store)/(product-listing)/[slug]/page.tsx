 
import { getBlogByCategoryAndSlug, getBlogBySlug, getProductByCategory, getProductBySlug } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import ProductView from "../ProductView";
import BlogView from "../../blogs/_components/BlogView";
import CategoryBlogs from "../../blogs/_components/CategoryBlog";

type PageProps = {
  slug: string;
};

 const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<PageProps>, 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 searchParams: any
}) => {
    
  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...(await searchParams) }; 

   // If we only have blog slug, fetch specific blog
   const blogs = await fetchBlogBySlug(slug);
   if (blogs) {
     return <BlogView data={blogs} />;
   }

  //  If we only have category blogs slug, fetch specific category blog
       const categoryBlogs = await fetchBlogByCategoryAndSlug(slug);
    if (categoryBlogs) {
      return <CategoryBlogs data={categoryBlogs} />;
    }
   

  const category = await fetchCategory(slug, combinedParams);
  if (category) {
    return (
      <CategoryProducts data={category}/>
    );
  }

  // If category doesn't exist, try product
  const product = await fetchProduct(slug, combinedParams);
  if (product) {
    return (
      <ProductView data={product} />
    );
  }
  
  notFound();
  
}

export default Page;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchCategory = async (slug: string, params: any) => {
  const response = await getProductByCategory(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchProduct = async (slug: string, params: any) => {
  const response = await getProductBySlug(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};
 
const fetchBlogByCategoryAndSlug = async (categorySlug: string) => {
  const response = await getBlogByCategoryAndSlug("geek-zone", categorySlug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogBySlug = async (slug: string) => {
  const response = await getBlogBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};
export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any
}) {
  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...await searchParams }; 
   
    const blog = await fetchBlogByCategoryAndSlug(slug);
    if (blog) {
      return {
        title: blog.title,
        description: "",
        openGraph: {
          title: blog.title,
          description: "",
          images: blog.image_url ? [{
            url: blog.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    }
  

  const categoryBlogs = await fetchBlogBySlug(slug);
  if (categoryBlogs) {
    return {
      title: categoryBlogs.name,
      description: categoryBlogs.description,
      openGraph: {
        title: categoryBlogs.name,
        description: categoryBlogs.description,
        images: categoryBlogs.image_url ? [{
          url: categoryBlogs.image_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }

  const category = await fetchCategory(slug, combinedParams);
  if (category) {
    return {
      title: category.name,
      description: category.description,
      openGraph: {
        title: category.name,
        description: category.description,
        images: category.logo_url ? [{
          url: category.logo_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }

  // If category doesn't exist, try product
  const product = await fetchProduct(slug, combinedParams);
  if (product) {
    return {
      title: `${product.name}`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.ProductImages.length > 0 ? [{
          url: product.ProductImages[0].image_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }
  
    return {
      title: 'Not Found',
      description: 'The requested page could not be found.'
    };
  
}
