import { User } from "./auth.config"; 

 
export interface TestimonialResponse {
    id: number;
    user_id: number;
    product_id: number | null;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    User: User;
}

export interface mailSubscriptionResponse {
    id: number;
    email: string;
    updatedAt: string;
    createdAt: string;
}

export interface BannerResponse {
    id: number;
    display_order: number;
    image_url: string;
    image_url_mobile?: string;
    image_url_mid: string;
    image_url_low: string;
    title: string;
    description: string;
    alt_text?: string;
    alt_text_mobile?: string;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    redirect_url: string;
}

export interface FooterConfig {
    title: string;
    links: string[]; 
}

export interface FaqResponse {
    id: number;
    entity_type: string;
    entity_id: number;
    question: string;
    answer: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface SeoData {
    canonicalUrl: string;
    createdAt: string;
    description: string;
    entityId: string;
    entityType: string;
    focusKeyword: string;
    id: number;
    noIndex: boolean;
    ogImage: string;
    slug: string;
    title: string;
    updatedAt: string;
}

export interface DynamicPageSlugResponse {
    slug: string;
    entity_type: "category" |  "product" | "blog" | "blog_category" | "brand" | "deal";
    entity_id: number; 
    seo: SeoData | null;
    description?: string;
    /** CKEditor HTML for category/brand type-card grid (slug-relation). */
    type_cards_html?: string | null;
    /** CKEditor HTML for additional rich content (tables/grids); omit/empty hides the section. */
    additional_text_box?: string | null;
    name?: string;
    deals?: Array<{
        id: number;
        name: string;
        slug: string;
        deal_type: string;
        required_qty: number;
        get_qty?: number;
        fixed_price: string;
        discount_percent?: number;
        tiered_qty_json?: { min: number; discount: number }[] | null;
        valid_from: string;
        valid_to: string;
        image_url?: string | null;
        product_count: number;
        bundle_product_ids_json?: string | null;
        createdAt: string;
    }>;
    deals_text?: string;
    banners?: Array<{
        image: string;
        alt: string;
        url: string;
        order: number;
    }>;
    buying_guide?: {
        label?: string;
        title?: string;
        highlights?: Array<string | { label: string }>;
        content?: string;
        contentHtml?: string;
        image_url?: string;
        imageUrl?: string;
        image_alt?: string;
        imageAlt?: string;
        defaultTabId?: string;
        tabs?: Array<{
            id?: string;
            label?: string;
            heading?: string;
            content?: string;
            contentHtml?: string;
        }>;
    };
}

export type FlashNewsResponse = FlashNewsItem[];

export interface FlashNewsItem {
    id: number;
    label: string;
    url: string;
    status: boolean;
    created_at: string;
    updatedBy: UpdatedBy;
}

export interface UpdatedBy {
    id: number;
    name: string;
}

export interface SeoMetaResponse {
    slug: string;
    entity_type: string;
    entity_id: number;
    name: string;
    description: string;
    logo_url: string;
}