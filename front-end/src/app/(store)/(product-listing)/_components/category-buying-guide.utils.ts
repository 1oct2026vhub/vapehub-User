import {
  CATEGORY_BUYING_GUIDE_BY_SLUG,
  CategoryBuyingGuideData,
  CategoryBuyingGuideTab,
  createDefaultCategoryBuyingGuide,
  DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
  PREFILLED_POD_KITS_GUIDE_TEMPLATE,
} from "@/lib/config/category-buying-guide.config";
import { DynamicPageSlugResponse } from "@/lib/config/global.config";
import { sanitizeBuyingGuideHtml } from "./buying-guide.utils";

type BuyingGuideApi = NonNullable<DynamicPageSlugResponse["buying_guide"]>;

function normalizeCategorySlug(slug: string): string {
  return slug
    .split("/")
    .filter(Boolean)
    .pop()
    ?.toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") ?? "";
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectSlugCandidates(...sources: Array<string | undefined | null>): string[] {
  const candidates = new Set<string>();

  for (const source of sources) {
    if (!source?.trim()) continue;
    const trimmed = source.trim();
    candidates.add(normalizeCategorySlug(trimmed));
    candidates.add(trimmed.toLowerCase());
    candidates.add(slugFromName(trimmed));
  }

  return Array.from(candidates).filter(Boolean);
}

function isPrefilledPodCategory(slugCandidates: string[], categoryName: string): boolean {
  const nameSlug = slugFromName(categoryName);
  const haystack = [...slugCandidates, nameSlug].join(" ");
  return /prefilled/.test(haystack) && /pod/.test(haystack);
}

function parseFeatureHighlights(feature?: string): string[] {
  if (!feature?.trim()) return [];

  return feature
    .split(/[|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function mapApiTabs(tabs?: BuyingGuideApi["tabs"]): CategoryBuyingGuideTab[] | undefined {
  if (!tabs?.length) return undefined;

  const mapped = tabs
    .map((tab, index) => {
      const contentHtml = sanitizeBuyingGuideHtml(
        tab.contentHtml?.trim() ?? tab.content?.trim() ?? "",
      );
      const label = tab.label?.trim();
      if (!label || !contentHtml) return null;

      return {
        id: tab.id?.trim() || `tab-${index + 1}`,
        label,
        heading: tab.heading?.trim() || label,
        contentHtml,
      };
    })
    .filter((tab): tab is CategoryBuyingGuideTab => Boolean(tab));

  return mapped.length ? mapped : undefined;
}

function buildGuideFromApi(
  apiGuide: BuyingGuideApi,
  categoryName: string,
): CategoryBuyingGuideData | null {
  const contentHtml = sanitizeBuyingGuideHtml(
    apiGuide.contentHtml?.trim() ?? apiGuide.content?.trim() ?? "",
  );
  const highlights = (apiGuide.highlights ?? [])
    .map((item) => (typeof item === "string" ? item : item.label).trim())
    .filter(Boolean);
  const tabs = mapApiTabs(apiGuide.tabs);

  if (!contentHtml && highlights.length === 0 && !tabs?.length) {
    return null;
  }

  return {
    label: apiGuide.label?.trim() || DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
    title: apiGuide.title?.trim() || categoryName,
    highlights,
    contentHtml,
    imageUrl: apiGuide.imageUrl?.trim() || apiGuide.image_url?.trim(),
    imageAlt: apiGuide.imageAlt?.trim() || apiGuide.image_alt?.trim() || categoryName,
    tabs,
    defaultTabId: apiGuide.defaultTabId?.trim() || tabs?.[0]?.id,
  };
}

function findConfigGuide(slugCandidates: string[], categoryName: string): CategoryBuyingGuideData | undefined {
  for (const key of slugCandidates) {
    if (CATEGORY_BUYING_GUIDE_BY_SLUG[key]) {
      return CATEGORY_BUYING_GUIDE_BY_SLUG[key];
    }
  }

  if (isPrefilledPodCategory(slugCandidates, categoryName)) {
    return PREFILLED_POD_KITS_GUIDE_TEMPLATE;
  }

  return undefined;
}

function applyDealsHighlight(
  guide: CategoryBuyingGuideData,
  categoryName: string,
  dealsText?: string,
): CategoryBuyingGuideData {
  const dealHighlight = dealsText?.trim();
  if (!dealHighlight) {
    return {
      ...guide,
      label: guide.label ?? DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
      title: guide.title ?? categoryName,
      imageAlt: guide.imageAlt ?? categoryName,
    };
  }

  const highlights = [...guide.highlights];
  if (highlights.length >= 3) {
    highlights[2] = dealHighlight;
  } else if (highlights.length > 0) {
    highlights.push(dealHighlight);
  }

  return {
    ...guide,
    label: guide.label ?? DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
    title: guide.title ?? categoryName,
    highlights: highlights.slice(0, 3),
    imageAlt: guide.imageAlt ?? categoryName,
  };
}

export function resolveCategoryBuyingGuide({
  categoryName,
  categorySlug,
  pageSlug,
  dynamicPageSlug,
  categoryFeature,
  categoryBuyingGuide,
  categoryDescription,
  categoryImageUrl,
  dealsText,
}: {
  categoryName: string;
  categorySlug: string;
  pageSlug?: string;
  dynamicPageSlug?: DynamicPageSlugResponse | null;
  categoryFeature?: string;
  categoryBuyingGuide?: BuyingGuideApi | null;
  categoryDescription?: string;
  categoryImageUrl?: string;
  dealsText?: string;
}): CategoryBuyingGuideData | null {
  if (!categoryName.trim() && !categorySlug.trim()) {
    return null;
  }

  const resolvedName = categoryName.trim() || categorySlug.replace(/[-_/]+/g, " ");
  const slugCandidates = collectSlugCandidates(
    pageSlug,
    categorySlug,
    dynamicPageSlug?.slug,
    resolvedName,
  );

  const apiSources = [categoryBuyingGuide, dynamicPageSlug?.buying_guide].filter(Boolean) as BuyingGuideApi[];
  for (const apiGuide of apiSources) {
    const fromApi = buildGuideFromApi(apiGuide, resolvedName);
    if (fromApi) return applyDealsHighlight(fromApi, resolvedName, dealsText);
  }

  const configGuide = findConfigGuide(slugCandidates, resolvedName);
  if (configGuide) {
    return applyDealsHighlight(configGuide, resolvedName, dealsText);
  }

  const featureHighlights = parseFeatureHighlights(categoryFeature);
  const description =
    categoryDescription?.trim() ||
    dynamicPageSlug?.description?.trim() ||
    "";

  return createDefaultCategoryBuyingGuide({
    categoryName: resolvedName,
    categoryDescription: description,
    categoryFeature: featureHighlights.length ? categoryFeature : undefined,
    dealsText,
    imageUrl: categoryImageUrl,
    imageAlt: resolvedName,
  });
}
