import { ROUTES } from "../routes";

export interface Category extends SubCategory {
    id: number;
    updated_by: string | null;    
    parent_id: number | null;
    logo_url: string;
    alt_text?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    description: string;
    /** CKEditor HTML for category type-card grid; omit/empty hides the section. */
    type_cards_html?: string | null;
    slug: string;
    feature?: string;
    subCategories: SubCategory[];
}
export interface SubCategory {
    name: string;
    slug: string;
    feature?: string;
}

/** Public related-links item (category/brand page quick links). */
export interface RelatedLink {
    text: string;
    url: string;
    sort_order?: number;
}

/** Shared shape for related-categories and related-brands responses. */
export interface RelatedCategoriesApiData {
    related_links: RelatedLink[];
}

export const defaultNavLinks:SubCategory[] = [
    {
        name: "Brands",
        slug: ROUTES.BRANDS,
    },
    {
        name: "Blogs",
        slug: ROUTES.BLOGS,
    },
    // {
    //     name: "Deals",
    //     slug: ROUTES.DEALS,
    // }

];

export enum CategoryDetails {
    title = "Shop By Category",
    viewAllHref = "/categories"
}