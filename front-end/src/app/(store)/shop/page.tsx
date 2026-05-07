import BreadCrumbs from '@/components/BreadCrumbs';
import {  AsyncReactElement, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { getProductList } from '@/lib/server.actions';
import { Metadata, NextPage } from 'next'; 
import ProductList from '../(product-listing)/_components/ProductList';
import { ROUTES } from '@/lib/routes';
import ProductListingContent from '@/components/ProductListingContent';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { Product, ProductReview } from '@/lib/config/product.config';

export const metadata: Metadata = {
  title: "Shop | VapeHub",
  description: "Browse VapeHub's full range of vape kits, e-liquids, disposables, pods, and accessories from top brands at competitive prices.",
};
type SearchParams = {
  searchParams: Promise<Record<string, string>>
}
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

    // Extract review data from products and format for ProductList
    const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = response.status === ServerActionStatus.SUCCESS && response.data.products ? response.data.products.map((product: Product) => ({
        status: ServerActionStatus.SUCCESS,
        data: {
            reviews: (product.reviews || []).map((review: ProductReview) => ({
                ...review,
                product_id: product.id,
                is_visible: true,
                updated_at: review.created_at,
                verified_by: Boolean(review.verified_by),
                user: review.user ? {
                    id: review.user.id,
                    first_name: review.user.first_name,
                    last_name: review.user.last_name,
                    profile_pic_url: review.user.profile_pic_url
                } : null,
                order: review.order ? {
                    id: review.order.id,
                    order_unique_id: review.order.order_unique_id
                } : null,
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug
                },
                media: []
            })),
            pagination: {
                total: product.review_stats?.total_reviews || 0,
                page: 1,
                limit: 1,
                totalPages: 1
            },
            average_rating: String(product.review_stats?.average_rating || 0),
            total_reviews: product.review_stats?.total_reviews || 0
        }
    })) : [];

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