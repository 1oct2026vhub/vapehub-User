import type { CartItem, CartVariantAttribute } from '@/lib/config/cart.config';
import type { AttributeTerms } from '@/lib/config/product.config';

const PARENT_URL_PREF_KEY = 'vh_cart_parent_product_urls';

/**
 * Dummy "simple product" workaround: variation attrs exist only so the SKU can be sold,
 * with "Visible on product page" unchecked and typically a single term per attr.
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
  item: Pick<CartItem, 'product_slug' | 'variantAttributes' | 'useParentProductUrl'>,
): string {
  if (shouldLinkCartItemToParentProduct(item.variantAttributes, item.useParentProductUrl)) {
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
