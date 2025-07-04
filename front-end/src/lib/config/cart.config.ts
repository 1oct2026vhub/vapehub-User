import { Product } from "./product.config";

export interface CART_RESPONSE_DATA {
    id: number;
    user_id: number;
    product_id: number;
    variant_id: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    flavor_id: number | null;
    product: Product;   
    variant: {
        id: number;
        product_id: number;
        slug: string;
        price: string;
        discount_price: string | null;
        purchase_price: string | null;
        weight: string | null;
        length: string | null;
        width: string | null;
        height: string | null;
        description: string;
        barcode: string | null;
        stock: number;
        low_stock_threshold: number;
        stock_status: string;
        status: string;
        updated_by: number;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        variantAttributes: {
            id: number;
            variant_id: number;
            attribute_id: number;
            term_id: number;
            is_visible: boolean;
            used_in_variation: boolean;
            updated_by: number;
            created_at: string;
            updated_at: string;
            deleted_at: string | null;
            attribute: {
                id: number;
                name: string;
                type: string;
            };
            term: {
                id: number;
                name: string;
                slug: string;
            };
        }[];
        variantImages: {
            id: number;
            variant_id: number;
            image_url: string;
            is_primary: boolean;
        }[];
    };
    subtotal: number;
    total: number;
    discount: number;
    applied_deals: {
        deal_id: number;
        deal_name: string;
        discount_amount: number;
    }[];
}

export interface CartData {
    items: CART_RESPONSE_DATA[];
    summary: {
        subtotal: number;
        total: number;
        total_discount: number;
    };
    deals: {
        deal_id: number;
        deal_name: string;
        discount_amount: number;
    }[];
}

export type CART_GET_PAYLOAD = {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export type CartItem = {
  id: number;
  product_id: number;
  product_slug: string;
  name: string;
  price: string;
  discount_price: string;
  variant_id: number;
  stock: number;
  slug: string;
  description: string;
  ProductImages: string;
  quantity: number;
  subtotal: number;
  total: number;
}
  
export type StockValidationResponse = {
    itemId: number;
    message: string;
    isOutOfStock: boolean;
}

export type UnAvailableItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  ProductImages: string;
  isOutOfStock: boolean;
  isInsufficientStock: boolean;
  isDeleted: boolean;
  errorMessage: string | null;
}

