type ListingPriceVariant = {
  id?: number;
  price?: string | number;
  regular_price?: string | number | null;
  discount_price?: string | number | null;
};

export type ListingPriceSource = {
  name?: string;
  price?: string | number;
  regular_price?: string | number | null;
  discount_price?: string | number | null;
  min_price_variant?: ListingPriceVariant | null;
  variants?: ListingPriceVariant[] | null;
};

const toPositiveNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/**
 * Listing APIs often omit product.regular_price.
 * Sale/original prices are resolved from the min-price variant when available.
 */
export const resolveProductCardPrices = (product: ListingPriceSource) => {
  const price = product.price != null ? String(product.price) : '';
  const currentPrice = toPositiveNumber(product.price);
  const variants = product.variants ?? [];
  const minVariantId = product.min_price_variant?.id;
  const matchedById = minVariantId != null
    ? variants.find((variant) => variant.id === minVariantId)
    : undefined;
  const matchedByPrice = variants.find((variant) => {
    const variantPrice = toPositiveNumber(variant.price);
    const variantRegular = toPositiveNumber(variant.regular_price);
    return variantPrice === currentPrice && variantRegular > currentPrice;
  });

  const regularCandidates = [
    product.regular_price,
    product.min_price_variant?.regular_price,
    matchedById?.regular_price,
    matchedByPrice?.regular_price,
  ];

  const regularPriceValue = regularCandidates.find((value) => toPositiveNumber(value) > 0);
  const regularPrice = regularPriceValue != null ? String(regularPriceValue) : undefined;

  return { price, regularPrice };
};
