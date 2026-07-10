// Base interface for common blog properties
interface BaseBlogEntity {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    alt_text?: string;
}

// Base interface for timestamp and deletion fields
interface TimeStampFields {
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by: number;
}

// Base interface for author information
export interface Author {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url?: string | null;
    role?: string | null;
    bio?: string | null;
    archive_url?: string | null;
    team_url?: string | null;
}

export interface BlogSourceItem {
    label: string;
    href: string;
    description: string;
}

export interface BlogPullQuote {
    body: string;
    location?: string;
    source_url?: string;
    attribution?: string;
    source_type?: string;
}

export interface BlogInlineProductCard {
    location?: string;
    cta_label?: string;
    product: {
        image: string;
        title: string;
        blurb?: string;
        url: string;
    };
}

export interface BlogFirstPersonCallout {
    label?: string;
    heading: string;
    body: string;
    /** @deprecated Placement is via {{firstPersonCallout:n}} placeholders or embedded markers in content */
    insert_after_paragraph?: number;
}

// Base interface for blog content
export interface BlogContent extends TimeStampFields {
    id: number;
    title: string;
    slug: string;
    content: string;
    image_url: string;
    alt_text?: string;
    author_id: number;
    published_at: string;
    author: Author;
}

export interface BlogResponse extends BaseBlogEntity {
    blogs: { id: number }[];
    blog_count: number;
}

export interface BlogBySlugResponse extends BaseBlogEntity, TimeStampFields {
    blogs: (BlogContent & {
        BlogCategoryRelation: {
            blog_id: number;
            category_id: number;
            created_at: string;
        };
        tags: unknown[];
    })[];
}
export interface BlogCategory  {
    
        id: number;
        name: string;
        slug: string;
        parent_id: number;
        parent: {
            id: number;
            name: string;
            slug: string;
        };
    
}
export interface BlogByCategoryAndSlugResponse extends BlogContent {
    categories: BlogCategory[];
    tags: unknown[];
    sources?: BlogSourceItem[];
    pull_quote?: BlogPullQuote | null;
    inline_product_card?: BlogInlineProductCard | null;
    first_person_callouts?: BlogFirstPersonCallout[];
    related_blogs: (BlogContent & {
        categories: (BaseBlogEntity & TimeStampFields)[];
    })[];
}

export interface BlogPostListResponse {
    blogs: (BlogContent & {
        categories: (BaseBlogEntity & TimeStampFields)[];
    })[]; 
    pagination: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };

}

export interface BlogList extends BlogContent {
    categories: (BaseBlogEntity & TimeStampFields)[];
}

export interface RelatedGuidesResponse {
    guides: BlogList[];
}

