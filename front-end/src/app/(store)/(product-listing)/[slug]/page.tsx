 
import { getProductByCategory, getProductBySlug } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import ProductView from "../ProductView";

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
  const combinedParams = { ...defaultParams, ...await searchParams };
  // If product doesn't exist, try category
 
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
 

export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any
}) {
  const slug = (await params).slug;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...await searchParams };

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
