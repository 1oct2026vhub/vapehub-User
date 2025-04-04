export interface ORDER_RESPONSE {
    id: number;
    order_unique_id: string;
    total: string;
    discount_price: string;
    status: string;
    createdAt: string;
    orderItems: {
    id: number;
    unit: string;
    unit_price: string;
    quantity: number;
    discount_price: string | null;
    total: string;
    product: {
        id: number;
        name: string;
        price: string;
    };
    variant: {
        id: number;
        slug: string;
        price: string;
        variantImages: unknown[];
    } | null;
    }[];
    shippingAddress: {
        name: string;
        street: string;
        town: string;
        post_code: string;
        phone: string;
    };
    billingAddress: {
        name: string;
        street: string;
        town: string;
        post_code: string;
        phone: string;
    };
    shippingMethod: {
        id: number;
        name: string;
        price: string;
    };
}
  