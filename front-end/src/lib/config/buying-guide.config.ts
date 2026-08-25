/** Public customer buying-guide API shapes (category & brand). */

export interface BuyingGuideHighlight {
  text: string;
}

export interface BuyingGuideTab {
  tab_title: string;
  section_heading: string;
  section_body: string;
  order: number;
}

export interface BuyingGuideRelatedBlog {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  alt_text: string | null;
  published_at: string;
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

/**
 * CTA flag shape from slug-relation / related-links APIs.
 * Disabled/missing → is_enabled: false with empty CTA strings.
 */
export interface BuyingGuideCta {
  is_enabled: boolean;
  cta_prompt: string;
  cta_label: string;
}

export interface PublicBuyingGuide {
  is_enabled: boolean;
  cta_prompt?: string;
  cta_label?: string;
  guide_label: string;
  title: string;
  intro_content?: string | null;
  banner_image?: string | null;
  banner_alt?: string | null;
  highlights?: BuyingGuideHighlight[];
  tabs?: BuyingGuideTab[];
  related_guides?: BuyingGuideRelatedBlog[];
}

export interface BuyingGuideApiData {
  /** Null when disabled/missing on the full buying-guide endpoint. */
  buyingGuide: PublicBuyingGuide | null;
}
