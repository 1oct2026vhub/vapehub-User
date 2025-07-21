import BreadCrumbs from '@/components/BreadCrumbs';
import {  AsyncReactElement, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { getProductList, getReviewOrderByProductId } from '@/lib/server.actions';
import { Metadata, NextPage } from 'next'; 
import ProductList from '../(product-listing)/_components/ProductList';
import { ROUTES } from '@/lib/routes';
import ProductListingContent from '@/components/ProductListingContent';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';

export const metadata: Metadata = {
  title: "Shop | VapeHub",
  description: "",
};
type SearchParams = {
  searchParams: Promise<Record<string, string>>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShopPage: NextPage<SearchParams> = async ({searchParams}):AsyncReactElement  => {
     
    const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0 } as const;
    const searchParamsData = await searchParams;
    const variantParams = Object.entries(searchParamsData)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      if (key.startsWith('attribute_')) {
        const attributeId = key.replace('attribute_', '');
        const values = value.split(',').map(Number);

        // Build variant object
        const variantObj = acc.variant ? JSON.parse(acc.variant as string) : {};
        variantObj[attributeId] = values;

        // Encode variant object as URL parameter
        acc.variant = JSON.stringify(variantObj);
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...defaultParams });
    const combinedParams = { ...defaultParams, ...variantParams };
    
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Shop", href: `/${ROUTES.SHOP}`, isActive: true },
      ];
    
    const response = await getProductList(combinedParams);
      if(response.status == ServerActionStatus.ERROR) {
        return (<p>{response.message}</p>);
      } 

    const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = response.status === ServerActionStatus.SUCCESS && response.data.products ? await Promise.all(
        response.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
    ) : [];

    const productListingData = {
        name: searchParamsData.keyword?.toString() || "Shop",
        description: `Showing results for "${searchParamsData.keyword?.toString() || 'all products'}"`,
        id: 0,
        slug: '',
        updated_by: null,
        parent_id: null,
        logo_url: '',
        is_active: true,
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        children: [],
        subCategories: [],

    };

    return (
        <div>
        <section className="product-listing-container flex-col">
          <BreadCrumbs items={breadcrumbs} />
          <ProductListingContent data={productListingData}/>
        </section>
        <ProductList data={response.data} reviews={reviews} />
        </div>
    );
};

export default ShopPage;