import {
  CategoryBuyingGuideData,
  CategoryBuyingGuideTab,
  DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
} from "@/lib/config/category-buying-guide.config";
import {
  BuyingGuideApiData,
  BuyingGuideRelatedBlog,
  PublicBuyingGuide,
} from "@/lib/config/buying-guide.config";
import { BlogList } from "@/lib/config/blog.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { getBrandBuyingGuide, getCategoryBuyingGuide } from "@/lib/server.actions";

const EMPTY_AUTHOR = {
  id: 0,
  first_name: null,
  last_name: null,
  email: "",
};

function mapTabs(tabs?: PublicBuyingGuide["tabs"]): CategoryBuyingGuideTab[] | undefined {
  if (!tabs?.length) return undefined;

  const mapped = [...tabs]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((tab, index) => {
      const label = tab.tab_title?.trim();
      const heading = tab.section_heading?.trim();
      const contentHtml = tab.section_body?.trim() ?? "";
      if (!label || !heading || !contentHtml) return null;

      return {
        id: `tab-${tab.order ?? index}`,
        label,
        heading,
        contentHtml,
      };
    })
    .filter((tab): tab is CategoryBuyingGuideTab => Boolean(tab));

  return mapped.length ? mapped : undefined;
}

/** Map public API guide → UI model. Returns null when guide is missing/disabled. */
export function mapPublicBuyingGuide(
  guide: PublicBuyingGuide | null | undefined,
  fallbackTitle?: string,
): CategoryBuyingGuideData | null {
  if (!guide || guide.is_enabled === false) {
    return null;
  }

  const tabs = mapTabs(guide.tabs);
  const highlights = (guide.highlights ?? [])
    .map((item) => item.text?.trim())
    .filter((text): text is string => Boolean(text))
    .slice(0, 3);

  const contentHtml = guide.intro_content?.trim() ?? "";
  const title = guide.title?.trim() || fallbackTitle?.trim() || "";
  const imageUrl = guide.banner_image?.trim() || undefined;

  if (!contentHtml && highlights.length === 0 && !tabs?.length && !imageUrl) {
    return null;
  }

  return {
    label: guide.guide_label?.trim() || DEFAULT_CATEGORY_BUYING_GUIDE_LABEL,
    title,
    highlights,
    contentHtml,
    imageUrl,
    imageAlt: guide.banner_alt?.trim() || title || fallbackTitle,
    tabs,
    defaultTabId: tabs?.[0]?.id,
  };
}

export function mapBuyingGuideRelatedBlogs(
  related?: BuyingGuideRelatedBlog[] | null,
): BlogList[] {
  if (!related?.length) return [];

  return related.slice(0, 3).map((blog) => {
    const publishedAt = blog.published_at || new Date().toISOString();
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: "",
      image_url: blog.image_url ?? "",
      alt_text: blog.alt_text ?? undefined,
      author_id: 0,
      published_at: publishedAt,
      created_at: publishedAt,
      updated_at: publishedAt,
      deleted_at: null,
      updated_by: 0,
      author: EMPTY_AUTHOR,
      categories: (blog.categories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: "",
        image_url: "",
        created_at: publishedAt,
        updated_at: publishedAt,
        deleted_at: null,
        updated_by: 0,
      })),
    };
  });
}

export type ResolvedBuyingGuideSection = {
  guide: CategoryBuyingGuideData | null;
  relatedGuides: BlogList[];
  /** Raw API flag — CTA / related collections / type cards should respect this. */
  isEnabled: boolean;
  ctaPrompt: string;
  ctaLabel: string;
};

const EMPTY_BUYING_GUIDE_SECTION: ResolvedBuyingGuideSection = {
  guide: null,
  relatedGuides: [],
  isEnabled: false,
  ctaPrompt: "",
  ctaLabel: "",
};

function resolveFromApiData(
  data: BuyingGuideApiData | undefined,
  fallbackTitle?: string,
): ResolvedBuyingGuideSection {
  const apiGuide = data?.buyingGuide;
  const isEnabled = apiGuide?.is_enabled === true;
  const ctaPrompt = apiGuide?.cta_prompt?.trim() ?? "";
  const ctaLabel = apiGuide?.cta_label?.trim() ?? "";
  const guide = mapPublicBuyingGuide(apiGuide, fallbackTitle);

  if (!guide || !isEnabled) {
    return { ...EMPTY_BUYING_GUIDE_SECTION, isEnabled, ctaPrompt, ctaLabel };
  }

  return {
    guide,
    relatedGuides: mapBuyingGuideRelatedBlogs(apiGuide?.related_guides),
    isEnabled,
    ctaPrompt,
    ctaLabel,
  };
}

/**
 * Prefer slug-relation CTA; fall back to full buying-guide API fields.
 * Show the green card only when is_enabled === true.
 */
export function resolveBuyingGuideCta(options: {
  slugRelationCta?: {
    is_enabled?: boolean;
    cta_prompt?: string;
    cta_label?: string;
  } | null;
  section?: Pick<ResolvedBuyingGuideSection, "isEnabled" | "ctaPrompt" | "ctaLabel">;
}): { show: boolean; prompt: string; label: string } {
  const fromSlug = options.slugRelationCta;
  const fromSection = options.section;

  const isEnabled =
    fromSlug?.is_enabled === true || fromSection?.isEnabled === true;

  const prompt =
    fromSlug?.cta_prompt?.trim() || fromSection?.ctaPrompt?.trim() || "";
  const label =
    fromSlug?.cta_label?.trim() || fromSection?.ctaLabel?.trim() || "";

  return {
    show: isEnabled,
    prompt,
    label,
  };
}

export async function fetchCategoryBuyingGuideSection(
  slug: string,
  fallbackTitle?: string,
): Promise<ResolvedBuyingGuideSection> {
  if (!slug.trim()) {
    return { ...EMPTY_BUYING_GUIDE_SECTION };
  }

  const response = await getCategoryBuyingGuide(slug);
  if (response.status !== ServerActionStatus.SUCCESS) {
    return { ...EMPTY_BUYING_GUIDE_SECTION };
  }

  return resolveFromApiData(response.data, fallbackTitle);
}

export async function fetchBrandBuyingGuideSection(
  slug: string,
  fallbackTitle?: string,
): Promise<ResolvedBuyingGuideSection> {
  if (!slug.trim()) {
    return { ...EMPTY_BUYING_GUIDE_SECTION };
  }

  const response = await getBrandBuyingGuide(slug);
  if (response.status !== ServerActionStatus.SUCCESS) {
    return { ...EMPTY_BUYING_GUIDE_SECTION };
  }

  return resolveFromApiData(response.data, fallbackTitle);
}
