import { getBlogByCategoryAndSlug, getBlogBySlug, getDynamicPageSlug, getProductByCategory, getProductBySlug } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import ProductView from "../ProductView";
import BlogView from "../../blogs/_components/BlogView";
import CategoryBlogs from "../../blogs/_components/CategoryBlog";
import { DynamicPageSlugResponse } from "@/lib/config/global.config";
import { CategoryResponseData, Product } from "@/lib/config/product.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse } from "@/lib/config/blog.config";

type PageProps = {
  slug: string;
};

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) => {

  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...(await searchParams) };
  const dynamicPageSlug = await fetchDynamicPageSlug(slug);
 
  if (!dynamicPageSlug) {
    notFound();
  }

  const entityTypeHandlers: Record<string, () => Promise<React.ReactNode>> = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(slug);
      return blogs && <BlogView data={blogs} />;
    },
    blog: async () => {
      const categoryBlogs = await fetchBlogByCategoryAndSlug(slug);  
      return categoryBlogs && <CategoryBlogs data={categoryBlogs} />;
    },
    category: async () => {
      const category = await fetchCategory(slug, combinedParams);
      return category && <CategoryProducts data={category} />;
    },
    product: async () => {
      const product = await fetchProduct(slug, combinedParams);
      return product && <ProductView data={product} />;
    }
  };

  const handler: () => Promise<React.ReactNode> = entityTypeHandlers[dynamicPageSlug.entity_type];
  if (!handler) {
    notFound();
  }

  const result: React.ReactNode = await handler();
  if (!result) {
    notFound();
  }

  return result;
}

export default Page;

const fetchDynamicPageSlug = async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchCategory = async (slug: string, params: any): Promise<CategoryResponseData | null> => {
  const response = await getProductByCategory(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchProduct = async (slug: string, params: any): Promise<Product | null> => {
  const response = await getProductBySlug(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogByCategoryAndSlug = async (categorySlug: string): Promise<BlogByCategoryAndSlugResponse | null> => {
  const response = await getBlogByCategoryAndSlug(categorySlug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogBySlug = async (slug: string): Promise<BlogBySlugResponse | null> => {
  const response = await getBlogBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};


export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) {
  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...await searchParams };
  const dynamicPageSlug = await fetchDynamicPageSlug(slug);
  if (!dynamicPageSlug) {
    notFound();
  }

  const metadataHandlers = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(slug);
      if (!blogs) return null;

      return {
        title: `${blogs.name} | VapeHub`,
        description: "",
        openGraph: {
          title: `${blogs.name} | VapeHub`,
          description: "",
          images: blogs.image_url ? [{
            url: blogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    blog: async () => {
      const categoryBlogs = await fetchBlogByCategoryAndSlug(slug);
      if (!categoryBlogs) return null;

      return {
        title: `${categoryBlogs.title} | VapeHub`,
        description: "",
        openGraph: {
          title: `${categoryBlogs.title} | VapeHub`, 
          description: "",
          images: categoryBlogs.image_url ? [{
            url: categoryBlogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    category: async () => {
      const category = await fetchCategory(slug, combinedParams);
      if (!category) return null;

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
    },

    product: async () => {
      const product = await fetchProduct(slug, combinedParams);
      if (!product) return null;

      return {
        title: product.name,
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
  };

  const handler = metadataHandlers[dynamicPageSlug.entity_type];
  if (!handler) {
    notFound();
  }

  const metadata = await handler();
  if (!metadata) {
    notFound();
  }

  return metadata;
}

  
