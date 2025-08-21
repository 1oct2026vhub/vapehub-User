import { Flavor } from "./product.config";

export interface Deal {
    id: number;
    name: string;
    slug: string;
    deal_type: string;
    required_qty: number | null;
    get_qty: number | null;
    fixed_price: string | null;
    discount_percent: number | null;
    tiered_qty_json: { min: number; discount: number }[] | null;
    valid_from: string;
    valid_to: string;
    createdAt: string;
    bundle_product_ids_json?: number[] | null;
    updated_at?: string;
    image_url?: string;
}

export interface CategoryWithDeals {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    deals: Deal[];
    deal_count: number;
    product_count: number;
    Products: ProductInDeal[];
}

export interface AllDealsResponse {
    deals: Deal[];
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
    };
    summary: {
        total_deals: number;
    };
}

export interface DealsByCategoryResponse {
    category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    };
    products: ProductInDeal[];
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
    };
    summary: {
        total_products_with_deals: number;
        total_deals: number;
    };
}

export interface ProductInDeal {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    regular_price: string;
    discount_price: string;
    stock_quantity: number | null;
    created_at: string;
    updated_at: string;
    flavor_count: number;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    brand: {
        id: number;
        name: string;
        slug: string;
    };
    primary_image: {
        id: number;
        url: string;
        is_primary: boolean;
    } | null;
    image?: {
        id: number;
        image_url: string;
        is_primary: boolean;
        product_id: number;
    };
    deals: Deal[];
    Flavors: Flavor[];
    puff_count: number;
    ProductImages: { image_url: string }[];
    out_of_stock?: boolean;
}

export interface CategoriesWithDealsResponse {
    categories: CategoryWithDeals[];
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
    };
    summary: {
        total_categories: number;
        total_deals: number;
        total_products: number;
    };
}

export interface CategoriesWithDealsPayload {
    limit?: number;
    offset?: number;
} 