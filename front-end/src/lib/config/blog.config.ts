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
interface Author {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
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

