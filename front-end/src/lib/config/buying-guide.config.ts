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

export interface PublicBuyingGuide {
  is_enabled: boolean;
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
  buyingGuide: PublicBuyingGuide | null;
}
