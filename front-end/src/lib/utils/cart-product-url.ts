import type { CartItem, CartVariantAttribute } from '@/lib/config/cart.config';
import type { AttributeTerms, ProductVariant, ProductViewDetails } from '@/lib/config/product.config';

const PARENT_URL_PREF_KEY = 'vh_cart_parent_product_urls';

/**
 * True when API asks FE to hide the picker AND variation attrs are not page-visible
 * (or attribute_terms are empty, which is typical when hide_variant_selector is true).
 */
export function shouldHideVariantSelector(
  product: Pick<ProductViewDetails, 'hide_variant_selector' | 'attribute_terms'> | null | undefined,
): boolean {
  if (!product?.hide_variant_selector) {
    return false;
  }
  const variationAttrs = (product.attribute_terms ?? []).filter(
    (attrTerm) => attrTerm.attribute.used_in_variation,
  );
  // API usually returns empty attribute_terms when the flag is true.
  if (variationAttrs.length === 0) {
    return true;
  }
  return variationAttrs.every((attrTerm) => attrTerm.attribute.is_visible_page === false);
}

/** Resolve the default/hidden variant for add-to-cart when the selector is hidden. */
export function resolveDefaultHiddenVariant(
  product: Pick<ProductViewDetails, 'default_variant_id' | 'default_variant_slug'> | null | undefined,
  variants: ProductVariant[] | undefined | null,
): ProductVariant | null {
  if (!variants?.length) {
    return null;
  }
  if (product?.default_variant_id != null) {
    const byId = variants.find((v) => v.id === product.default_variant_id);
    if (byId) return byId;
  }
  if (product?.default_variant_slug) {
    const bySlug = variants.find((v) => v.slug === product.default_variant_slug);
    if (bySlug) return bySlug;
  }
  return variants[0] ?? null;
}

/**
 * @deprecated Prefer shouldHideVariantSelector — kept for callers that only have attribute_terms.
 */
export function isHiddenVariationOnlyProduct(
  attributeTerms: AttributeTerms[] | undefined | null,
): boolean {
  const variationAttrs = (attributeTerms ?? []).filter(
    (attrTerm) => attrTerm.attribute.used_in_variation,
  );
  if (variationAttrs.length === 0) {
    return false;
  }
  return variationAttrs.every(
    (attrTerm) =>
      attrTerm.attribute.is_visible_page === false && attrTerm.terms.length <= 1,
  );
}

export function mapVariantAttributesForCart(
  attrs: { attribute_id: number; term_slug: string }[],
  attributeTerms?: AttributeTerms[] | null,
): CartVariantAttribute[] {
  return attrs.map((attr) => {
    const meta = attributeTerms?.find((a) => a.attribute.id === attr.attribute_id)?.attribute;
    return {
      attribute_id: attr.attribute_id,
      term_slug: attr.term_slug,
      is_visible_page: meta?.is_visible_page,
      used_in_variation: meta?.used_in_variation,
    };
  });
}

function parentUrlPrefKey(productId: number, variantId: number): string {
  return `${productId}:${variantId}`;
}

/** Remember PDP-derived preference so logged-in cart reloads still link to the parent slug. */
export function rememberCartParentProductUrl(
  productId: number,
  variantId: number,
  useParent: boolean,
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(PARENT_URL_PREF_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    map[parentUrlPrefKey(productId, variantId)] = useParent;
    sessionStorage.setItem(PARENT_URL_PREF_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export function getRememberedCartParentProductUrl(
  productId: number,
  variantId: number,
): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(PARENT_URL_PREF_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, boolean>;
    const value = map[parentUrlPrefKey(productId, variantId)];
    return typeof value === 'boolean' ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Prefer an explicit flag. Otherwise infer from cart line attrs:
 * single hidden variation attribute (dummy workaround) → parent PDP URL.
 * Missing flags fail closed (keep variant URL) so real variants stay unchanged.
 */
export function shouldLinkCartItemToParentProduct(
  attrs: CartVariantAttribute[] | undefined | null,
  useParentProductUrl?: boolean,
): boolean {
  if (useParentProductUrl === true) {
    return true;
  }
  if (useParentProductUrl === false) {
    return false;
  }
  if (!attrs?.length) {
    return true;
  }
  // Only the single-attr dummy pattern; multi-attr real variants keep deep links.
  if (attrs.length !== 1) {
    return false;
  }
  const [attr] = attrs;
  if (attr.is_visible_page === undefined) {
    return false;
  }
  return attr.is_visible_page === false && attr.used_in_variation !== false;
}

export function buildCartProductUrl(
  item: Pick<CartItem, 'product_slug' | 'variantAttributes'> &
    Partial<Pick<CartItem, 'useParentProductUrl' | 'product_id' | 'variant_id'>>,
): string {
  const remembered =
    typeof item.product_id === 'number' && typeof item.variant_id === 'number'
      ? getRememberedCartParentProductUrl(item.product_id, item.variant_id)
      : undefined;
  const useParent = item.useParentProductUrl ?? remembered;

  if (shouldLinkCartItemToParentProduct(item.variantAttributes, useParent)) {
    return `/${item.product_slug}`;
  }

  const queryParams = new URLSearchParams();
  item.variantAttributes.slice(1).forEach((attr) => {
    queryParams.set(attr.attribute_id.toString(), attr.term_slug);
  });
  const primaryTermSlug = item.variantAttributes[0]?.term_slug ?? '';
  const queryString = queryParams.toString();
  return `/${item.product_slug}/${primaryTermSlug}${queryString ? `?${queryString}` : ''}`;
}

/** Cart/checkout line title: omit variant terms when hide_variant_selector / parent-URL mode. */
export function formatCartLineProductName(
  productName: string,
  attributeLabels: string | null | undefined,
  omitVariantLabel: boolean,
): string {
  if (omitVariantLabel || !attributeLabels?.trim()) {
    return productName;
  }
  return `${productName} - ${attributeLabels.trim()}`;
}

/**
 * For persisted guest lines that already stored "Name - term", strip the suffix when
 * parent-URL / hidden-selector mode applies (single dummy attribute).
 */
export function stripCartLineVariantSuffix(name: string, omitVariantLabel: boolean): string {
  if (!omitVariantLabel) return name;
  const dashIdx = name.lastIndexOf(' - ');
  if (dashIdx <= 0) return name;
  return name.slice(0, dashIdx);
}
/** Re-apply parent-URL preference onto persisted guest cart lines. */
export function enrichCartItemParentUrlFlag(item: CartItem): CartItem {
  const remembered = getRememberedCartParentProductUrl(item.product_id, item.variant_id);
  const useParentProductUrl =
    item.useParentProductUrl ??
    remembered ??
    shouldLinkCartItemToParentProduct(item.variantAttributes);
  const name = stripCartLineVariantSuffix(item.name, useParentProductUrl === true);
  if (item.useParentProductUrl === useParentProductUrl && item.name === name) {
    return item;
  }
  return { ...item, useParentProductUrl, name };
}
