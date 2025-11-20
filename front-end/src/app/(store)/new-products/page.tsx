import BreadCrumbs from '@/components/BreadCrumbs';
import ProductListingContent from '@/components/ProductListingContent';
import { AsyncReactElement, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { Product, ProductReview } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import { getProductList } from '@/lib/server.actions';
import { Metadata, NextPage } from 'next';
import ProductList from '../(product-listing)/_components/ProductList';

export const metadata: Metadata = {
  title: "New Products | VapeHub",
  description: "Discover the latest arrivals at VapeHub.",
};

type SearchParams = {
  searchParams: Promise<Record<string, string>>
}
const NewProductsPage: NextPage<SearchParams> = async ({ searchParams }): AsyncReactElement => {
  const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0, is_new: true } as const;
  const searchParamsData = await searchParams;

  const variantParams = Object.entries(searchParamsData)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      if (key.startsWith('attribute_')) {
        const attributeId = key.replace('attribute_', '');
        const values = value.split(',').map(Number);

        const variantObj = acc.variant ? JSON.parse(acc.variant as string) : {};
        variantObj[attributeId] = values;
        acc.variant = JSON.stringify(variantObj);
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...defaultParams });

  const combinedParams = { ...defaultParams, ...variantParams, is_new: true };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "New In", href: ROUTES.NEW_PRODUCTS, isActive: true },
  ];

  const response = await getProductList(combinedParams);
  if (response.status === ServerActionStatus.ERROR) {
    return (<p>{response.message}</p>);
  }

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
    name: "New In",
    description: `Showing latest arrivals${searchParamsData.keyword ? ` for "${searchParamsData.keyword}"` : ''}`,
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
        <ProductListingContent data={productListingData} />
      </section>
      <ProductList data={response.data} reviews={reviews} />
    </div>
  );
};

export default NewProductsPage;

