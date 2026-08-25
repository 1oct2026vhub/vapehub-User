 
export interface BrandConfig {
    id: number;
    updated_by: number | null;
    slug: string;
    name: string;
    description?: string;
    /** CKEditor HTML for brand type-card grid; omit/empty hides the section. */
    type_cards_html?: string | null;
    /** CKEditor HTML for additional rich content (tables/grids); omit/empty hides the section. */
    additional_text_box?: string | null;
    alt_text?: string;
    logo_url: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface BrandListResponse {
    brands: BrandConfig[];
    pagination: {
        currentPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface BrandListPayload {
    page: number;
    limit: number;
}

