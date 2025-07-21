import { getAllDeals, getProductList, getReviewOrderByProductId } from "@/lib/server.actions";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import { Deal } from "@/lib/config/deal.config";
import DealProduct from "../_components/DealProduct";
import { Metadata } from "next";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

type PageProps = {
  slug: string;
};

const Page = async ({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) => {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.ERROR) {
    return notFound();
  }

  const deal = dealResponse.data.deals.find((d: Deal) => d.slug.replace(/ /g, '-') === slug);
  
  if (!deal) {
    return notFound();
  }

  const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
  const combinedParams = { ...defaultParams, ...Object.fromEntries(Object.entries(searchParamsData)), deal_id: deal.id };

  const productsResponse = await getProductList(combinedParams);
  
  if (productsResponse.status === ServerActionStatus.ERROR || !productsResponse.data?.products) {
    return notFound();
  }

  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = productsResponse.status === ServerActionStatus.SUCCESS && productsResponse.data.products ? await Promise.all(
    productsResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];
  
  return <DealProduct deal={deal} data={productsResponse.data} reviews={reviews} />;
};

export default Page;

export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.SUCCESS) {
    const deal = dealResponse.data.deals.find((d: Deal) => d.slug.replace(/ /g, '-') === slug);

    if (deal) {
      const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
      const combinedParams = { ...defaultParams, ...Object.fromEntries(Object.entries(searchParamsData)), deal_id: deal.id };
      const productsResponse = await getProductList(combinedParams);
      
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