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

export interface BlogResponse {
    id: number;
    user_id: number;
    blog_group: string;
    title: string;
    content: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    User: User;
}

export interface BannerResponse {
    id: number;
    display_order: number;
    image_url: string;
    image_url_mid: string;
    image_url_low: string;
    title: string;
    description: string;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}