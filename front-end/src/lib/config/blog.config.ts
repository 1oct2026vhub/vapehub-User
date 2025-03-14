import { Category } from "./category.config";

// Base interface for common blog properties
interface BaseBlogEntity {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
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
interface BlogContent extends TimeStampFields {
    id: number;
    title: string;
    slug: string;
    content: string;
    image_url: string;
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

export interface BlogByCategoryAndSlugResponse extends BlogContent {
    categories: Category[];
    tags: unknown[];
    related_blogs: (BlogContent & {
        categories: (BaseBlogEntity & TimeStampFields)[];
    })[];
}