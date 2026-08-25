import { BrandConfig } from "./brand.config";
import { Category } from "./category.config";
import { DynamicPageSlugResponse } from "./global.config";

export interface ProductFilters {
    brand?: string;
    categories?: string;
    price_range?: string;
    variants?: Record<string, string[]>;
    nonVariants?: Record<string, string>;
}

export interface Pagination {
    current_page: number;
    limit: number;
    offset: number;
    total_count: number;
    total_pages: number;
}

export type ProductResponseData = {
    products: Product[];
    pagination: Pagination;
    attributes: AttributeTerms[],
    price_ranges: PriceRange[],
    brand: BRAND[],
    category: CATEGORY[]

}

export interface ProductFlavor {
    product_id: number;
    flavor_id: number;
    price: string;
    discount_price: string;
    stock_quantity: number;
}

export interface Flavor {
    id: number;
    name: string;
    description: string;
    ProductFlavor: ProductFlavor;
}

export interface ProductImage {
    id: number;
    updated_by?: number | null;
    product_id?: number;
    image_url: string;
    is_primary: boolean;
    alt_text?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}
export interface prodAttribute {
    id: number;
    name: string;
    type: "select" | "radio" | "checkbox";
}
export interface prodTerm {
    id: number;
    name: string;
    slug: string;
}
export interface productAttributeTerms {
    id: number;
    product_id: number;
    attribute_id: number;
    term_id: number;
    is_visible_page: boolean;
    used_in_variation: boolean;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    attribute: prodAttribute;
    term: prodTerm;
}
 interface productAttributes {
    id: number;
    name: string;
    type: string;
    image_url: string;
    is_visible: boolean;
    is_visible_page: boolean;
    used_in_variation: boolean;
}
export interface productAttributesTerms {
    id: number;
    name: string;
    slug: string;
    product_count: number;
    is_visible_page: boolean;
    used_in_variation: boolean;
    is_selected: boolean;
    description?: string;
    // variant_slugs?: string[];
}
export interface AttributeProductTerms {
    attribute: productAttributes;
    terms: productAttributesTerms;
}
export interface AttributeTerms {
    attribute: productAttributes;
    terms: productAttributesTerms[];
}
export type ProductReview = {
    id: number;
    user_id: number | null;
    order_id: number | null;
    user_name: string;
    company_name: string;
    rating: number;
    comment: string;
    verified_by: number;
    testimonial: number;
    created_at: string;
    review_date: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        profile_pic_url: string | null;
    } | null;
    order: {
        id: number;
        order_unique_id: string;
    } | null;
};

export type ProductReviewStats = {
    average_rating: number | string;
    total_reviews: number;
    rating_distribution: Record<string | number, number>;
    verified_reviews: number;
    testimonials: number;
};

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    regular_price?: string;
    discount_price?: string;
    min_price_variant?: {
        id?: number;
        price?: string;
        regular_price?: string;
        discount_price?: string | null;
    } | null;
    variants?: {
        id?: number;
        price?: string;
        regular_price?: string;
        discount_price?: string | null;
    }[];
    primary_image?: { url: string };
    deleted_at?: string | null;
    flavor_count?: number | string;
    // Properties required by ProductList.tsx
    Category?: Category | null;
    ProductImages: ProductImage[];
    deals?: { 
        id: number, 
        name: string, 
        required_qty: number,
        deal_type?: string,
        discount_percent?: number,
        fixed_price?: string
    }[];
    Flavors?: Flavor[];
    puff_count?: number | string;
    createdAt?: string;
    out_of_stock?: boolean;
    is_discontinued?: boolean;
    is_coming_soon?: boolean;
    is_new?: boolean;
    reviews?: ProductReview[];
    review_stats?: ProductReviewStats;
}

export interface SimilarProduct extends Product {
    primary_image: {
        id: number;
        url: string;
        is_primary: boolean;
        alt_text?: string | null;
    };
}

export interface MoreLikeThisResponse {
    products: Product[];
    similar_products: SimilarProduct[];
    pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
    };
}
 
export interface CategoryResponseData extends Category {
    products: Product[];
    pagination: Pagination;
    attributes: AttributeTerms[],
    price_ranges: PriceRange[],
    brand: BRAND[],
    category?: CATEGORY[]
    buying_guide?: DynamicPageSlugResponse["buying_guide"];
}
interface BRAND {
    id: number;
    name: string;
    product_count: number;
    slug: string;
}
interface CATEGORY {
    id: number;
    name: string;
    product_count: number;
    slug: string;
}
export interface PriceRange {
    label: string;
    value: string;
    count: number;
}

export interface BrandByProductResponse extends BrandConfig {
    products: Product[];
    pagination: Pagination;
    attributes: AttributeTerms[],
    price_ranges: PriceRange[],
    brand?: BRAND[],
    category: CATEGORY[]
}
export interface ProductVariant {
    attributes: {
    attribute_id: number;
    attribute_name: string;
    term_id: number;
    term_name: string;
    term_slug: string;
    attribute_image_url: string;
    }[];
    id: number;
    slug: string;
    price: string;
    regular_price: string;
    discount_price: string;
    stock: number;
    stock_status: string;
    status: string;
    is_in_stock: boolean;
    is_discontinued?: boolean;
    description?: string;
    primary_image: {
        id: number;
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number;
    };
    all_images: {
        id: number;
        url: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number;
    }[];
}
export interface StockSummary {
    total: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
}
export interface ProductResponse {
    product: ProductViewDetails;
    variants: ProductVariant[];
    available_terms: AttributeTerms[];
    filtered_attribute_terms: AttributeTerms[];
    stock_summary: StockSummary;
}

export interface productAllImages {
    id: number;
    url: string;
    is_primary: boolean;
    alt_text?: string | null;
    sort_order?: number;
}

export interface Deal {
  id: number;
  name: string;
  deal_type: string;
  required_qty: number;
  fixed_price: string;
}

export interface LoyaltySettings {
  program_name: string;
  points_value: number;
  loyalty_amount: string;
  loyalty_amount_type: string;
  minimum_points_redemption: number;
  minimum_purchase_amount: string;
  min_amount_for_loyalty_points: string;  
  status: boolean;
}

export interface LoyaltyPoints {
  calculated: number;
}

export interface ProductDescriptionResponse {
    product_id: number;
    description?: string;
    product_description?: string;
    variant_description?: string;
    variant_id?: number | null;
}

export interface ProductViewDetails {

    id: number;
    name: string;
    slug: string;
    description?: string;
    key_highlights?: string;
    category: Category | null;
    brand: BrandConfig | null;
    product_brands: BrandConfig[];
    createdAt: string;
    created_at: string;
    primary_image: productAllImages;
    all_images: productAllImages[];
    attribute_terms: AttributeTerms[];
    deals: Deal[];
    loyaltySettings: LoyaltySettings | null;
    loyaltyPoints?: LoyaltyPoints | null;
    puff_count?: number | string;
    is_discontinued?: boolean;
    is_coming_soon?: boolean;
    is_new?: boolean;
    review_stats?: ProductReviewStats;
};

export interface AppliedFilters {
    attributeId: number;
    attribute: string;
    count: number;
    value: string;
    type: string;
}

export const NON_VARIANT_FILTERS = [
    'brand', 
    'categories', 
    'price_range', 
    'deal_id'  // Add deal filter
];
