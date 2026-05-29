import { PRODUCT_DESCRIPTION_QUERY, PRODUCT_VARIANT_ATTRIBUTE } from '@/lib/api-routes';
import { ProductDescriptionResponse, ProductResponse } from '@/lib/config/product.config';

/** Resolve HTML description from the dedicated description API response. */
export function resolveDescriptionHtml(data: ProductDescriptionResponse | null | undefined): string {
  if (!data) return '';
  const variantDescription = data.variant_description?.trim();
  if (variantDescription) return variantDescription;

  const productDescription =
    data.product_description?.trim() ||
    data.description?.trim() ||
    '';
  return productDescription;
}

/** Build query params for the description API from current PDP variant state. */
export function buildProductDescriptionQuery(
  productData: ProductResponse,
): PRODUCT_DESCRIPTION_QUERY | undefined {
  const hasFilteredTerms = (productData.filtered_attribute_terms?.length ?? 0) > 0;
  const hasAvailableTerms = (productData.available_terms?.length ?? 0) > 0;
  const isReadyVariant =
    hasFilteredTerms && !hasAvailableTerms && productData.variants?.length === 1;
  const isSimpleProduct = !hasFilteredTerms && !hasAvailableTerms;

  if (isReadyVariant && productData.variants[0]) {
    const variant = productData.variants[0];
    const attribute_terms: PRODUCT_VARIANT_ATTRIBUTE[] = variant.attributes.map((attr) => ({
      attribute_id: attr.attribute_id,
      term_id: attr.term_id,
    }));
    return {
      variant_id: variant.id,
      attribute_terms,
    };
  }

  if (isSimpleProduct && productData.variants.length === 1) {
    return { variant_id: productData.variants[0].id };
  }

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
): string {
  return `${productId}:${JSON.stringify(params ?? {})}`;
}
