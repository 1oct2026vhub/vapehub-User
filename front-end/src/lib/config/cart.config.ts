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
    applied_deals: AppliedDeal[];
    show_deal_toast: boolean;
    deal_required_qty: number | null;
    deal_qty_needed: number | null;
    deals: {
        deal_id: number;
        deal_name: string;
        discount_amount: number;
        required_qty: number;
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
    subtotal: number;
    total: number;
    applied_deals?: AppliedDeal[];
    show_deal_toast?: boolean;
    deal_required_qty?: number | null;
    deal_qty_needed?: number | null;
}

export type CART_GET_PAYLOAD = {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

/** Attribute payload stored on cart lines for PDP deep links. */
export type CartVariantAttribute = {
  attribute_id: number;
  term_slug: string;
  /** Mirrors admin "Visible on product page"; false for dummy variation attrs. */
  is_visible_page?: boolean;
  used_in_variation?: boolean;
};

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
  applied_deals: AppliedDeal[];
  show_deal_toast: boolean;
  deal_required_qty: number | null;
  deal_qty_needed: number | null;
  deals: { 
    id: number, 
    name: string, 
    required_qty: number,
    deal_type?: string,
    discount_percent?: number,
    fixed_price?: string
  }[];
  variantAttributes: CartVariantAttribute[];
  /**
   * When true, cart/order links use /{product_slug} only (dummy hidden-variation products).
   * Set at add-to-cart from full product attribute_terms; inferred from API for logged-in carts.
   */
  useParentProductUrl?: boolean;
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

export interface AppliedDeal {
    deal_id: number;
    deal_name: string;
    discount_amount: number;
}

