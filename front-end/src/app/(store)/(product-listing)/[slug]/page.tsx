 
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
}: {
  params: Promise<PageProps>
}) => {
  const slug = (await params).slug;
  // If product doesn't exist, try category
  const category = await fetchCategory(slug);
  if (category) {
    return (
      <CategoryProducts  />
    );
  }

  // If category doesn't exist, try product
  const product = await fetchProduct(slug);
  if (product) {
    return (
      <ProductView data={product} />
    );
  }
  
  notFound();
  
}

export default Page;

const fetchCategory = async (slug: string) => {
  const response = await getProductByCategory(slug, { sort_by: "id", order: "ASC", limit: 20, offset: 0 });
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchProduct = async (slug: string) => {
  const response = await getProductBySlug(slug, { sort_by: "id", order: "ASC", limit: 20, offset: 0 });
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};
 

export async function generateMetadata({ params }: {
  params: Promise<PageProps>
}) {
  const slug = (await params).slug;
  
  const category = await fetchCategory(slug);
  if (category) {
    return {
      title: `${category.name} | VapeHub UK`,
      description: category.description || `Browse our selection of ${category.name} products.`,
      openGraph: {
        title: `${category.name} | VapeHub UK`,
        description: category.description || `Browse our selection of ${category.name} products.`,
        images: category.logo_url ? [{
          url: category.logo_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }

  // If category doesn't exist, try product
  const product = await fetchProduct(slug);
  if (product) {
    return {
      title: `${product.name} | VapeHub UK`,
      description: product.description || `Buy ${product.name} vape products at VapeHub UK.`,
      openGraph: {
        title: `${product.name} | VapeHub UK`,
        description: product.description || `Buy ${product.name} vape products at VapeHub UK.`,
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
