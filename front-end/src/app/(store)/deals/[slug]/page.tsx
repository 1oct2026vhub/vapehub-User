import { getDealsByCategory, getAllDeals } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
import DealProduct from "@/app/(store)/(product-listing)/DealProduct";
import { Deal, DealsByCategoryResponse } from "@/lib/config/deal.config";

type PageProps = {
  params: {
    slug: string;
  }
};

const Page = async ({ params }: PageProps) => {
  const { slug } = params;

  const dealResponse = await getAllDeals({ search: slug, limit: 1 });
  
  if (dealResponse.status === ServerActionStatus.ERROR) {
    return notFound();
  }

  const deal = dealResponse.data?.deals[0];
  if (!deal) {
    return notFound();
  }

  const productsResponse = await getDealsByCategory(0, { deal_id: deal.id, limit: 12, offset: 0 });
  
  if (productsResponse.status === ServerActionStatus.ERROR) {
    return notFound();
  }
  
  return <DealProduct deal={deal} data={productsResponse.data} />;
};

export default Page;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  const dealResponse = await getAllDeals({ search: slug, limit: 1 });
  
  if (dealResponse.status === ServerActionStatus.SUCCESS) {
    const deal = dealResponse.data.deals[0];

    if (deal) {
      const productsResponse = await getDealsByCategory(0, { deal_id: deal.id });

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