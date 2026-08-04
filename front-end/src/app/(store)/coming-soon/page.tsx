import BreadCrumbs from '@/components/BreadCrumbs';
import ProductListingContent from '@/components/ProductListingContent';
import { AsyncReactElement, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { Product, ProductReview } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import { getProductList } from '@/lib/server.actions';
import { toAbsoluteUrl } from '@/lib/seo-schema';
import { PRODUCT_PAYLOAD } from '@/lib/api-routes';
import { unstable_noStore } from 'next/cache';
import { Metadata, NextPage } from 'next';
import ProductList from '../(product-listing)/_components/ProductList';
import { resolveSiteUrl } from '@/lib/site-url';

const BASE_URL = resolveSiteUrl();

/** Latest first, coming-soon-only list. */
const COMING_SOON_DEFAULT_PARAMS = {
  sort_by: 'id',
  order: 'DESC',
  limit: 12,
  offset: 0,
  is_coming_soon: true,
} as const;

/**
 * Shared with generateMetadata so canonical / prev / next match the list request.
 */
function buildComingSoonListParams(searchParamsData: Record<string, string>): {
  combinedParams: PRODUCT_PAYLOAD;
  pageNumber: number;
} {
  const normalizedSearchParams: Record<string, string> = { ...searchParamsData };
  const pageFromUrl = parseInt(normalizedSearchParams.page ?? '1', 10);
  const pageNumber = !Number.isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  const limit = Number(COMING_SOON_DEFAULT_PARAMS.limit) || 12;

  if (!Number.isNaN(pageFromUrl) && pageFromUrl > 1) {
    normalizedSearchParams.offset = String((pageFromUrl - 1) * limit);
  } else {
    normalizedSearchParams.offset = '0';
  }
  delete normalizedSearchParams.page;

  const variantParams = Object.entries(normalizedSearchParams).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
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
    },
    { ...COMING_SOON_DEFAULT_PARAMS },
  );

  const combinedParams = {
    ...COMING_SOON_DEFAULT_PARAMS,
    ...variantParams,
    is_coming_soon: true,
  } as PRODUCT_PAYLOAD;
  return { combinedParams, pageNumber };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  unstable_noStore();
  const searchParamsData = await searchParams;
  const { combinedParams, pageNumber } = buildComingSoonListParams(searchParamsData);

  const response = await getProductList(combinedParams, false);
  if (response.status !== ServerActionStatus.SUCCESS || !response.data) {
    return {
      title: 'Coming Soon | VapeHub',
      description: 'Preview upcoming products at VapeHub before they launch.',
    };
  }

  const totalPages = Math.max(1, response.data.pagination?.total_pages ?? 1);
  const root = `${ROUTES.COMING_SOON}/`;
  const hasValidPage = pageNumber > 1;
  const canonicalUrl = hasValidPage
    ? toAbsoluteUrl(BASE_URL, `${root}?page=${pageNumber}`)
    : toAbsoluteUrl(BASE_URL, root);

  const prevPage = pageNumber > 1 ? pageNumber - 1 : undefined;
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : undefined;

  const prevHref = prevPage
    ? toAbsoluteUrl(BASE_URL, prevPage === 1 ? root : `${root}?page=${prevPage}`)
    : undefined;
  const nextHref = nextPage ? toAbsoluteUrl(BASE_URL, `${root}?page=${nextPage}`) : undefined;

  const paginationIconLinks = [
    ...(prevHref ? [{ rel: 'prev' as const, url: prevHref }] : []),
    ...(nextHref ? [{ rel: 'next' as const, url: nextHref }] : []),
  ];

  return {
    title: 'Coming Soon | VapeHub',
    description: 'Preview upcoming products at VapeHub before they launch.',
    alternates: {
      canonical: canonicalUrl,
    },
    ...(paginationIconLinks.length ? { icons: { other: paginationIconLinks } } : {}),
  };
}

type SearchParams = {
  searchParams: Promise<Record<string, string>>;
};

const ComingSoonPage: NextPage<SearchParams> = async ({ searchParams }): AsyncReactElement => {
  const searchParamsData = await searchParams;
  const { combinedParams } = buildComingSoonListParams(searchParamsData);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Coming Soon', href: ROUTES.COMING_SOON, isActive: true },
  ];

  const response = await getProductList(combinedParams);
  if (response.status === ServerActionStatus.ERROR) {
    return (
      <div className="product-listing-container py-6">
        <h1 className="primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit">Coming Soon</h1>
        <p className="mt-2 text-content-1 text-skin-neutral-500">
          Coming soon products are temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] =
    response.status === ServerActionStatus.SUCCESS && response.data.products
      ? response.data.products.map((product: Product) => ({
          status: ServerActionStatus.SUCCESS,
          data: {
            reviews: (product.reviews || []).map((review: ProductReview) => ({
              ...review,
              product_id: product.id,
              is_visible: true,
              updated_at: review.created_at,
              verified_by: Boolean(review.verified_by),
              user: review.user
                ? {
                    id: review.user.id,
                    first_name: review.user.first_name,
                    last_name: review.user.last_name,
                    profile_pic_url: review.user.profile_pic_url,
                  }
                : null,
              order: review.order
                ? {
                    id: review.order.id,
                    order_unique_id: review.order.order_unique_id,
                  }
                : null,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
              },
              media: [],
            })),
            pagination: {
              total: product.review_stats?.total_reviews || 0,
              page: 1,
              limit: 1,
              totalPages: 1,
            },
            average_rating: String(product.review_stats?.average_rating || 0),
            total_reviews: product.review_stats?.total_reviews || 0,
          },
        }))
      : [];

  const productListingData = {
    name: 'Coming Soon',
    description: `Showing upcoming products${searchParamsData.keyword ? ` for "${searchParamsData.keyword}"` : ''}`,
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

export default ComingSoonPage;
