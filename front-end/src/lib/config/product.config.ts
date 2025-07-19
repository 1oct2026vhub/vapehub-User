import { BrandConfig } from "./brand.config";
import { Category } from "./category.config";

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
    updated_by: number | null;
    product_id: number;
    image_url: string;
    is_primary: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
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

}
export interface AttributeProductTerms {
    attribute: productAttributes;
    terms: productAttributesTerms;
}
export interface AttributeTerms {
    attribute: productAttributes;
    terms: productAttributesTerms[];
}
export interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    primary_image?: { url: string };
    
    // Properties required by ProductList.tsx
    Category?: Category | null;
    ProductImages?: ProductImage[];
    deals?: { name: string }[];
    Flavors?: Flavor[];
    puff_count?: number | string;
    createdAt?: string;
}
 
export interface CategoryResponseData extends Category {
    products: Product[];
    pagination: Pagination;
    attributes: AttributeTerms[],
    price_ranges: PriceRange[],
    brand: BRAND[],
    category?: CATEGORY[]
  
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
interface PriceRange {
    label: string;
    count: number;
    value: string;
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
    discount_price: string;
    stock: number;
    stock_status: string;
    status: string;
    is_in_stock: boolean;
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
}

export interface Deal {
  name: string;
  deal_type: string;
  required_qty: number;
  fixed_price: string;
}

export interface ProductViewDetails {

    id: number;
    name: string;
    slug: string;
    description: string;
    category: Category | null;
    brand: BrandConfig | null;
    createdAt: string;
    primary_image: productAllImages;
    all_images: productAllImages[];
    attribute_terms: AttributeTerms[];
    deals: Deal[];
};

export interface AppliedFilters {
    attributeId: number;
    attribute: string;
    count: number;
    value: string;
    type: string;
}

export const NON_VARIANT_FILTERS = ['brand', 'categories', 'price_range', 'order', 'offset'];
