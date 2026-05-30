import { PRODUCT_DESCRIPTION_QUERY, PRODUCT_VARIANT_ATTRIBUTE } from '@/lib/api-routes';
import { ProductDescriptionResponse, ProductResponse, ProductVariant } from '@/lib/config/product.config';

/** Resolved variant when all variation attributes are selected (or simple single-variant product). */
export function getResolvedVariant(productData: ProductResponse): ProductVariant | null {
  const hasFilteredTerms = (productData.filtered_attribute_terms?.length ?? 0) > 0;
  const hasAvailableTerms = (productData.available_terms?.length ?? 0) > 0;
  const isReadyVariant =
    hasFilteredTerms && !hasAvailableTerms && productData.variants?.length === 1;
  const isSimpleProduct = !hasFilteredTerms && !hasAvailableTerms;

  if (isReadyVariant && productData.variants[0]) {
    return productData.variants[0];
  }
  if (isSimpleProduct && productData.variants.length === 1) {
    return productData.variants[0];
  }
  return null;
}

/** Variant HTML from filter-variants when a variant is fully selected. */
export function getVariantDescriptionFromProductData(productData: ProductResponse): string {
  return getResolvedVariant(productData)?.description?.trim() ?? '';
}

/** Resolve HTML description from the dedicated description API response (product-level). */
export function resolveProductDescriptionHtml(
  data: ProductDescriptionResponse | null | undefined,
): string {
  if (!data) return '';
  return (
    data.product_description?.trim() ||
    data.description?.trim() ||
    data.variant_description?.trim() ||
    ''
  );
}

/** Variant description from filter-variants wins; otherwise product description from API. */
export function resolveDisplayDescription(
  variantDescriptionFromFilter: string,
  productDescriptionFromApi: string,
): string {
  if (variantDescriptionFromFilter) return variantDescriptionFromFilter;
  return productDescriptionFromApi;
}

/** @deprecated Use resolveProductDescriptionHtml — kept for callers expecting API merge with variant_description. */
export function resolveDescriptionHtml(data: ProductDescriptionResponse | null | undefined): string {
  return resolveProductDescriptionHtml(data);
}

/** Build query params for the description API from current PDP variant state. */
export function buildProductDescriptionQuery(
  productData: ProductResponse,
): PRODUCT_DESCRIPTION_QUERY | undefined {
  const resolvedVariant = getResolvedVariant(productData);

  if (resolvedVariant) {
    const attribute_terms: PRODUCT_VARIANT_ATTRIBUTE[] = resolvedVariant.attributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      term_id: attr.term_id,
    }));
    return {
      variant_id: resolvedVariant.id,
      attribute_terms,
    };
  }

  const hasFilteredTerms = (productData.filtered_attribute_terms?.length ?? 0) > 0;
  if (hasFilteredTerms) {
    const attribute_terms = productData.filtered_attribute_terms.flatMap((attributeTerm) =>
      attributeTerm.terms.map((term) => ({
        attribute_id: attributeTerm.attribute.id,
        term_id: term.id,
      })),
    );
    if (attribute_terms.length) {
      return { attribute_terms };
    }
  }

  return undefined;
}

export function buildDescriptionCacheKey(
  productId: number,
  params?: PRODUCT_DESCRIPTION_QUERY,
  resolvedVariantId?: number | null,
): string {
  return `${productId}:${resolvedVariantId ?? 'none'}:${JSON.stringify(params ?? {})}`;
}
