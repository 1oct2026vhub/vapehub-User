import { AsyncReactElement, RouteParams, ServerActionStatus} from '@/lib/config/app.config';
import { NextPage } from 'next';
import React from 'react'; 
import BrandProducts from '../_components/BrandProducts';
import { getProductByBrand } from '@/lib/server.actions';
import { notFound } from 'next/navigation';
 

interface Props {
    params: Promise<RouteParams>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchParams: any
}
 
const BrandPage: NextPage<Props> = async ({
    params,
    searchParams}): AsyncReactElement => {
        const slug = (await params).slug as string;
        const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
        const combinedParams = { ...defaultParams, ...await searchParams };

        
  const brandProduct = await fetchBrandProduct(slug, combinedParams);
  if (brandProduct) {
    return (
      <BrandProducts data={brandProduct}/>
    );
  } 
  notFound();

};


export default BrandPage;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchBrandProduct = async (slug: string, params: any) => {
  const response = await getProductByBrand(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};



export async function generateMetadata({ params, searchParams }: {
  params: Promise<RouteParams>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any
}) {
  const slug = (await params).slug as string;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 };
  const combinedParams = { ...defaultParams, ...await searchParams };

  const brandProduct = await fetchBrandProduct(slug, combinedParams);
  if (brandProduct) {
    return {
      title: `${brandProduct.name} | VapeHub`,
      description: "",
      openGraph: {
        title: `${brandProduct.name} | VapeHub`,
        description: "",
        images: brandProduct.logo_url ? [{
          url: brandProduct.logo_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }
}