import { getAllDeals, getProductList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import { Deal } from "@/lib/config/deal.config";
import DealProduct from "../_components/DealProduct";

type PageProps = {
  params: {
    slug: string;
  }
};

const Page = async ({ params, searchParams }: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { slug } = params;

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.ERROR) {
    return notFound();
  }

  const deal = dealResponse.data.deals.find((d: Deal) => d.slug === slug);
  
  if (!deal) {
    return notFound();
  }

  const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
  const combinedParams = { ...defaultParams, ...Object.fromEntries(Object.entries(searchParams)), deal_id: deal.id };

  const productsResponse = await getProductList(combinedParams as any);
  
  if (productsResponse.status === ServerActionStatus.ERROR || !productsResponse.data?.products) {
    return notFound();
  }
  
  return <DealProduct deal={deal} data={productsResponse.data as any} />;
};

export default Page;

export async function generateMetadata({ params, searchParams }: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.SUCCESS) {
    const deal = dealResponse.data.deals.find((d: Deal) => d.slug === slug);

    if (deal) {
      const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
      const combinedParams = { ...defaultParams, ...Object.fromEntries(Object.entries(searchParams)), deal_id: deal.id };
      const productsResponse = await getProductList(combinedParams as any);
      
      if (productsResponse.status === ServerActionStatus.SUCCESS) {
        return {
          title: deal.name,
          description: deal.name,
          openGraph: {
            title: deal.name,
            description: deal.name,
            images: productsResponse.data.products[0]?.primary_image?.url ? [{
              url: productsResponse.data.products[0]?.primary_image?.url,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
    }
  }
  return {
    title: 'Deal not found',
  };
} 