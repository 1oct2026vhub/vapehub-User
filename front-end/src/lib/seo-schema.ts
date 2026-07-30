import type { ProductResponse, ProductVariant } from "@/lib/config/product.config";
import type { FaqResponse } from "@/lib/config/global.config";
import type { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

export type BrandListingProductRef = {
  name: string;
  slug: string;
};

export const SCHEMA_CONTEXT = "https://schema.org";

/** Max length for product schema description (plain text, SEO-friendly). */
const PRODUCT_DESCRIPTION_MAX_LENGTH = 160;

/**
 * Converts HTML to plain text for schema: strips tags and comments, normalizes whitespace, truncates.
 */
export function htmlToPlainText(html: string, maxLength: number = PRODUCT_DESCRIPTION_MAX_LENGTH): string {
  if (!html || typeof html !== "string") return "";
  let text = html
    .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments (e.g. wp:paragraph)
    .replace(/<[^>]+>/g, " ")        // Remove HTML tags
    .replace(/\s+/g, " ")             // Collapse whitespace
    .trim();
  if (maxLength > 0 && text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7) text = text.slice(0, lastSpace);
    text = text + (text.endsWith(".") ? "" : "...");
  }
  return text;
}

/**
 * Ensures a URL is absolute. If it already starts with http(s), return as-is.
 * Otherwise prepend baseUrl (with single slash between).
 */
export function toAbsoluteUrl(baseUrl: string, url: string): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return baseUrl;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = baseUrl.replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export interface ProductSchemaInput {
  productResponse: ProductResponse;
  productUrl: string;
  baseUrl: string;
  ratingData: AggregateRatingData | null;
  currency?: string;
  descriptionOverride?: string;
  nameOverride?: string;
}

/**
 * Build Product JSON-LD from API data. Uses first variant for price/availability when present.
 */
export function buildProductSchema(input: ProductSchemaInput): Record<string, unknown> {
  const {
    productResponse,
    productUrl,
    baseUrl,
    ratingData,
    currency = "GBP",
    descriptionOverride,
    nameOverride,
  } = input;
  const product = productResponse.product;
  const firstVariant = productResponse.variants?.[0];
  const price = firstVariant?.price ?? (product as { price?: string }).price ?? "0";
  const inStock = firstVariant != null
    ? firstVariant.is_in_stock === true
    : (productResponse.stock_summary?.in_stock ?? 0) > 0;
  // Primary first — Google often uses the first Product.image URL for thumbnails.
  const orderedImages = product.all_images?.length
    ? [
        ...product.all_images.filter((img) => img.is_primary),
        ...product.all_images.filter((img) => !img.is_primary),
      ]
    : product.primary_image?.url
      ? [product.primary_image]
      : [];
  const images = orderedImages
    .map((img) => toAbsoluteUrl(baseUrl, img.url))
    .filter((url, index, arr) => url && arr.indexOf(url) === index);
  const brandName = product.brand?.name ?? product.product_brands?.[0]?.name ?? "Unknown";

  const schema: Record<string, unknown> = {
    "@id": `${productUrl}#product`,
    "@type": "Product",
    name: nameOverride?.trim() || product.name,
    description: descriptionOverride?.trim() || htmlToPlainText(product.description ?? ""),
    // Omit invalid homepage fallback — empty/wrong image hurts Google thumbnails
    ...(images.length ? { image: images } : {}),
    sku: (product as { sku?: string }).sku ?? String(product.id),
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: String(price),
      priceCurrency: currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (ratingData && ratingData.reviewCount > 0 && ratingData.avgRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingData.avgRating,
      reviewCount: ratingData.reviewCount,
    };
  }

  return schema;
}

export interface BreadcrumbSchemaInput {
  baseUrl: string;
  categoryName: string;
  categorySlug: string;
  productName: string;
  productUrl: string;
  shopLabel?: string;
  shopPath?: string;
}

/**
 * Build BreadcrumbList JSON-LD: Home -> Shop -> Category -> Product.
 */
export function buildBreadcrumbSchema(input: BreadcrumbSchemaInput): Record<string, unknown> {
  const {
    baseUrl,
    categoryName,
    categorySlug,
    productName,
    productUrl,
    shopLabel = "Shop",
    shopPath = "/shop",
  } = input;

  const homeUrl = baseUrl.replace(/\/$/, "");
  const shopUrl = toAbsoluteUrl(baseUrl, shopPath);
  const categoryUrl = toAbsoluteUrl(baseUrl, `/${categorySlug}`);

  return {
    "@id": `${productUrl}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
      { "@type": "ListItem", position: 2, name: shopLabel, item: shopUrl },
      { "@type": "ListItem", position: 3, name: categoryName, item: categoryUrl },
      { "@type": "ListItem", position: 4, name: productName, item: productUrl },
    ],
  };
}

/**
 * Build FAQPage JSON-LD only when FAQs exist. Map question/answer to schema.org Question/Answer.
 */
export function buildFaqSchema(
  faqs: FaqResponse[],
  pageUrl?: string,
): Record<string, unknown> | null {
  if (!faqs?.length) return null;
  const seenFaqKeys = new Set<string>();
  const uniqueFaqs = faqs.filter((faq) => {
    const normalizedQuestion = (faq.question ?? "").trim().toLowerCase();
    const normalizedAnswer = htmlToPlainText(faq.answer ?? "", 0).trim().toLowerCase();
    if (!normalizedQuestion || !normalizedAnswer) return false;
    const dedupeKey = `${normalizedQuestion}::${normalizedAnswer}`;
    if (seenFaqKeys.has(dedupeKey)) return false;
    seenFaqKeys.add(dedupeKey);
    return true;
  });
  if (!uniqueFaqs.length) return null;
  return {
    ...(pageUrl ? { "@id": `${pageUrl}#faq` } : {}),
    "@type": "FAQPage",
    mainEntity: uniqueFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        // FAQ answers should be plain text for best results in rich snippets.
        text: htmlToPlainText(faq.answer, 0),
      },
    })),
  };
}

function schemaPrimaryTypes(node: Record<string, unknown>): string[] {
  const t = node["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string");
  return [];
}

function isFaqPageGraphNode(node: Record<string, unknown>): boolean {
  return schemaPrimaryTypes(node).includes("FAQPage");
}

function graphNodeUsesSingletonType(
  node: Record<string, unknown>,
  singletonTypes: ReadonlySet<string>,
): boolean {
  return schemaPrimaryTypes(node).some((type) => singletonTypes.has(type));
}

function extractFaqMainEntities(mainEntity: unknown): Record<string, unknown>[] {
  if (!Array.isArray(mainEntity)) return [];
  return mainEntity.filter(
    (e): e is Record<string, unknown> =>
      e !== null && typeof e === "object" && !Array.isArray(e),
  );
}

/**
 * Deduplicate top-level schema nodes by serialized payload.
 * Collapses multiple FAQPage nodes into one (merged mainEntity, question-level dedupe)
 * so validators only see a single FAQPage instance per @graph.
 */
export function dedupeSchemaGraphNodes(
  nodes: Array<Record<string, unknown> | null | undefined>,
): Record<string, unknown>[] {
  const seen = new Set<string>();
  const seenSingletonTypes = new Set<string>();
  const deduped: Record<string, unknown>[] = [];
  const faqQuestionEntities: Record<string, unknown>[] = [];
  let faqPageId: string | null = null;
  /** At most one node per type in the final @graph (validators count each Product node). */
  const singletonSchemaTypes = new Set<string>(["Product", "BreadcrumbList"]);

  for (const node of nodes) {
    if (!node) continue;
    if (isFaqPageGraphNode(node)) {
      const nodeId = node["@id"];
      if (!faqPageId && typeof nodeId === "string" && nodeId.trim()) {
        faqPageId = nodeId.trim();
      }
      faqQuestionEntities.push(...extractFaqMainEntities(node["mainEntity"]));
      continue;
    }
    if (graphNodeUsesSingletonType(node, singletonSchemaTypes)) {
      const typesInNode = schemaPrimaryTypes(node).filter((t) =>
        singletonSchemaTypes.has(t),
      );
      if (typesInNode.some((t) => seenSingletonTypes.has(t))) {
        continue;
      }
      typesInNode.forEach((t) => seenSingletonTypes.add(t));
    }
    const key = JSON.stringify(node);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(node);
  }

  if (faqQuestionEntities.length > 0) {
    const seenQuestion = new Set<string>();
    const uniqueQuestions: Record<string, unknown>[] = [];
    for (const q of faqQuestionEntities) {
      const qKey = JSON.stringify(q);
      if (seenQuestion.has(qKey)) continue;
      seenQuestion.add(qKey);
      uniqueQuestions.push(q);
    }
    if (uniqueQuestions.length > 0) {
      deduped.push({
        ...(faqPageId ? { "@id": faqPageId } : {}),
        "@type": "FAQPage",
        mainEntity: uniqueQuestions,
      });
    }
  }

  return deduped;
}

export interface BrandBreadcrumbSchemaInput {
  baseUrl: string;
  brandPageUrl: string;
  brandName: string;
  brandsLabel?: string;
  brandsPath?: string;
}

/** BreadcrumbList JSON-LD: Home -> Brands -> Brand. */
export function buildBrandBreadcrumbSchema(input: BrandBreadcrumbSchemaInput): Record<string, unknown> {
  const {
    baseUrl,
    brandPageUrl,
    brandName,
    brandsLabel = "Brands",
    brandsPath = "/brands",
  } = input;

  const homeUrl = baseUrl.replace(/\/$/, "");
  const brandsUrl = toAbsoluteUrl(baseUrl, brandsPath);

  return {
    "@id": `${brandPageUrl}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
      { "@type": "ListItem", position: 2, name: brandsLabel, item: brandsUrl },
      { "@type": "ListItem", position: 3, name: brandName, item: brandPageUrl },
    ],
  };
}

export interface BrandItemListSchemaInput {
  baseUrl: string;
  brandPageUrl: string;
  products: BrandListingProductRef[];
}

/** ItemList JSON-LD for products on the current brand listing page. */
export function buildBrandItemListSchema(
  input: BrandItemListSchemaInput,
): Record<string, unknown> | null {
  const { baseUrl, brandPageUrl, products } = input;
  if (!products.length) return null;

  const itemListId = `${brandPageUrl}#itemlist`;

  return {
    "@id": itemListId,
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: toAbsoluteUrl(baseUrl, `/${product.slug}/`),
      },
    })),
  };
}

export interface BrandCollectionPageSchemaInput {
  baseUrl: string;
  brandPageUrl: string;
  brandName: string;
  description?: string;
  itemListId?: string;
}

/** CollectionPage JSON-LD for brand listing pages. */
export function buildBrandCollectionPageSchema(
  input: BrandCollectionPageSchemaInput,
): Record<string, unknown> {
  const { baseUrl, brandPageUrl, brandName, description, itemListId } = input;
  const plainDescription = htmlToPlainText(description ?? "");

  const schema: Record<string, unknown> = {
    "@id": `${brandPageUrl}#webpage`,
    "@type": "CollectionPage",
    name: brandName,
    url: brandPageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "VapeHub",
      url: baseUrl.replace(/\/$/, ""),
    },
  };

  if (plainDescription) {
    schema.description = plainDescription;
  }
  if (itemListId) {
    schema.mainEntity = { "@id": itemListId };
  }

  return schema;
}

export interface BrandJsonLdInput {
  baseUrl: string;
  brandPageUrl: string;
  brandName: string;
  description?: string;
  products: BrandListingProductRef[];
}

/** Build brand page JSON-LD: CollectionPage + ItemList + BreadcrumbList @graph. */
export function buildBrandJsonLdData(input: BrandJsonLdInput): Record<string, unknown> {
  const { baseUrl, brandPageUrl, brandName, description, products } = input;
  const itemListSchema = buildBrandItemListSchema({ baseUrl, brandPageUrl, products });
  const itemListId =
    itemListSchema && typeof itemListSchema["@id"] === "string"
      ? itemListSchema["@id"]
      : undefined;

  const graph = dedupeSchemaGraphNodes([
    buildBrandCollectionPageSchema({
      baseUrl,
      brandPageUrl,
      brandName,
      description,
      itemListId,
    }),
    itemListSchema,
    buildBrandBreadcrumbSchema({ baseUrl, brandPageUrl, brandName }),
  ]);

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": graph,
  };
}

export type AggregateRatingData = { avgRating: number; reviewCount: number };

/**
 * Build aggregate rating for schema/UI. Falls back to averaging individual review ratings
 * when summary average_rating is missing or zero.
 */
export function deriveAggregateRating(
  totalReviews: number,
  averageRating: number | string | null | undefined,
  reviews?: Array<{ rating?: number | string | null }>,
): AggregateRatingData | null {
  const reviewCount = Math.max(0, Math.floor(Number(totalReviews) || 0));
  if (reviewCount <= 0) return null;

  let avgRating = parseFloat(String(averageRating ?? "").trim());
  if (!Number.isFinite(avgRating) || avgRating <= 0) {
    const ratings = (reviews ?? [])
      .map((review) => parseFloat(String(review.rating ?? "")))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (ratings.length > 0) {
      avgRating = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
    } else {
      return null;
    }
  }

  return { avgRating, reviewCount };
}

/** Merge rating candidates; prefers the source with the highest review count. */
export function mergeAggregateRatingData(
  ...sources: Array<AggregateRatingData | null | undefined>
): AggregateRatingData | null {
  const valid = sources.filter(
    (source): source is AggregateRatingData =>
      !!source && source.reviewCount > 0 && source.avgRating > 0,
  );
  if (!valid.length) return null;

  return valid.reduce((best, current) =>
    current.reviewCount > best.reviewCount
      || (current.reviewCount === best.reviewCount && current.avgRating > best.avgRating)
      ? current
      : best,
  );
}

/**
 * Extract rating summary from review API response for schema (must match UI).
 */
export function getRatingFromReviewResponse(data: REVIEW_ORDER_RESPONSE | null): AggregateRatingData | null {
  if (!data) return null;
  return deriveAggregateRating(data.total_reviews, data.average_rating, data.reviews);
}

const VARIANT_OFFERS_DESC = /^the\s+(.+?)\s+offers\s+([\s\S]+)$/i;

export function buildVariantFirstTitle(variant: string, baseTitle: string): string {
  const v = variant.trim();
  const base = baseTitle.trim().replace(/\s*\|\s*vapehub\s*$/i, "").trim();
  const core = base.toLowerCase().startsWith(v.toLowerCase()) ? base.slice(v.length).trim() : base;
  return `${v} ${core}`.replace(/\s+/g, " ").trim() + " | VapeHub";
}

/** Plain-text variant description from API when all attribute selections match. */
export function findVariantDescriptionBySelections(
  variants: ProductVariant[] | undefined,
  selectedAttributeSlugs: Record<number, string>,
): string {
  if (!variants?.length) return "";
  const active = Object.entries(selectedAttributeSlugs).filter(([, slug]) => slug?.trim());
  if (!active.length) return "";
  const match = variants.find((variant) =>
    active.every(([idStr, slug]) => {
      const attributeId = Number(idStr);
      return variant.attributes.some(
        (a) => a.attribute_id === attributeId && a.term_slug === slug,
      );
    }),
  );
  return htmlToPlainText(match?.description ?? "", 0).trim();
}

export function buildVariantFirstDescription(
  variant: string,
  _productName: string,
  seoDescription?: string,
  productDescription?: string,
  variantDescription?: string,
): string {
  const v = variant.trim();
  let body = String(seoDescription ?? "").trim().replace(/^buy\s+.+?\s+at\s+vapehub\.?\s*/i, "").trim();
  if (!body) {
    body = htmlToPlainText(String(variantDescription ?? ""), 0).trim();
  }
  if (!body) {
    body = htmlToPlainText(String(productDescription ?? ""), 0).trim();
  }
  if (!body) return "";
  body = body.replace(/long lasting performance\s*&\s*flavour/gi, "long lasting flavour");
  if (new RegExp(`^the\\s+${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i").test(body)) {
    return body.replace(/\s+/g, " ").trim();
  }
  const m = body.match(VARIANT_OFFERS_DESC);
  if (m) return `The ${v} ${m[1].trim()} offers ${m[2].trim()}`.replace(/\s+/g, " ").trim();
  const lb = body.toLowerCase();
  if (lb.includes(v.toLowerCase())) return body.replace(/\s+/g, " ").trim();
  if (/^the\s+/i.test(body)) return `The ${v} ${body.replace(/^the\s+/i, "").trim()}`.replace(/\s+/g, " ").trim();
  return `The ${v} ${body}`.replace(/\s+/g, " ").trim();
}
