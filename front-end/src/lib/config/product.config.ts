import { BrandConfig } from "./brand.config";
import { Category } from "./category.config";

 

interface Pagination {
    current_page: number;
    limit: number;
    offset: number;
    total_count: number;
    total_pages: number;
}

export type ProductResponseData = {
    products: Product[];
    pagination: Pagination;
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

export interface Product {
    id: number;
    updated_by: number | null;
    name: string;
    slug: string;
    description: string;
    price: string;
    discount_price: string;
    stock_quantity: number;
    puff_count: number;
    is_new: boolean;
    battery_capacity: string;
    coil_style: string;
    device_style: string;
    eliquid_capacity: string;
    pod_coil_style: string;
    pod_fill_style: string;
    power_supply: string;
    nicotine_strength: string;
    nicotine_type: string;
    vg_ratio: string;
    vaping_style: string;
    bottle_size: string;
    category_id: number;
    brand_id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    Category: Category;
    Brand: BrandConfig;
    ProductImages: [];
    Flavors: Flavor[];
}