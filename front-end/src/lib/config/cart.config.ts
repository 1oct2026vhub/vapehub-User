import { Product } from "./product.config";

export interface CART_RESPONSE_DATA  {
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
    discount_price: string;
    purchase_price: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    description: string;
    barcode: string;
    stock: number;
    low_stock_threshold: number;
    stock_status: string;
    status: string;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    variantAttributes: unknown[];
    variantImages: unknown[];
  };
}
export type CART_GET_PAYLOAD = {
  product_id: number;
  variant_id?: number;
  quantity: number;
}
