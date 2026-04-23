import type { ProductResponse } from "@/lib/config/product.config";
import type { FaqResponse } from "@/lib/config/global.config";
import type { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

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
  ratingData: { avgRating: number; reviewCount: number } | null;
  currency?: string;
}

/**
 * Build Product JSON-LD from API data. Uses first variant for price/availability when present.
 */
export function buildProductSchema(input: ProductSchemaInput): Record<string, unknown> {
  const { productResponse, productUrl, baseUrl, ratingData, currency = "GBP" } = input;
  const product = productResponse.product;
  const firstVariant = productResponse.variants?.[0];
  const price = firstVariant?.price ?? (product as { price?: string }).price ?? "0";
  const inStock = firstVariant != null
    ? firstVariant.is_in_stock === true
    : (productResponse.stock_summary?.in_stock ?? 0) > 0;
  const images = product.all_images?.length
    ? product.all_images.map((img) => toAbsoluteUrl(baseUrl, img.url))
    : product.primary_image?.url
      ? [toAbsoluteUrl(baseUrl, product.primary_image.url)]
      : [];
  const brandName = product.brand?.name ?? product.product_brands?.[0]?.name ?? "Unknown";

  const schema: Record<string, unknown> = {
    "@id": `${productUrl}#product`,
    "@type": "Product",
    name: product.name,
    description: htmlToPlainText(product.description ?? ""),
    image: images.length ? images : [toAbsoluteUrl(baseUrl, "/")],
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
  /** At most one node per type in the final @graph (validators count each Product node). */
  const singletonSchemaTypes = new Set<string>(["Product", "BreadcrumbList"]);

  for (const node of nodes) {
    if (!node) continue;
    if (isFaqPageGraphNode(node)) {
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
        "@type": "FAQPage",
        mainEntity: uniqueQuestions,
      });
    }
  }

  return deduped;
}

/**
 * Extract rating summary from review API response for schema (must match UI).
 */
export function getRatingFromReviewResponse(data: REVIEW_ORDER_RESPONSE | null): { avgRating: number; reviewCount: number } | null {
  if (!data) return null;
  const reviewCount = data.total_reviews ?? 0;
  if (reviewCount <= 0) return null;
  const avgRating = parseFloat(String(data.average_rating ?? 0)) || 0;
  return { avgRating, reviewCount };
}
