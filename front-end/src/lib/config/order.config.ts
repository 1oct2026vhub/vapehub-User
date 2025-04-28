import { USER_ADDRESS_RESPONSE } from "./user.config";

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
            slug: string;
            ProductImages: {
                image_url: string;
            }[];
        };
        variant: {
            id: number;
            slug: string;
            price: string;
            variantImages: { image_url: string }[];
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
export interface PAGINATION {
    total_pages: number;
    current_page: number;
    total_items: number;
}
export interface ORDER_LIST_RESPONSE {
    orders: ORDER_RESPONSE[];
    pagination: PAGINATION;
}

export interface PLACE_ORDER_PAYLOAD {
    email: string;
    phone: string;
    couponCode?: string;
    shipping_method_id: number;
    shipping_address: {
        first_name: string;
        last_name: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        region: string;
        country: string;
        post_code: string;
    };
    billing_address: {
        first_name: string;
        last_name: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        region: string;
        country: string;
        post_code: string;
    };
    useShippingAsBilling: boolean;
    payment_method: {
        method: string;
    };
    total: number;
}

export interface SHIPPING_METHOD {
    id: number;
    name: string;
    description?: string | null;
    message?: string | null;
    price: number;
}

// export const SHIPPING_METHODS: SHIPPING_METHOD[] = [
//     {
//         id: 1,
//         name: 'Royal Mail Tracked 48',
//         description: '2 to 4 working days',
//         message: 'Free for orders over £30',
//         price: 10.02
//     },
//     {
//         id: 2,
//         name: 'Royal Mail Tracked 24',
//         description: '1 to 2 working days',
//         price: 12.22
//     },
//     {
//         id: 3,
//         name: 'Royal Mail Next Day Guaranteed',
//         price: 15.59
//     },
//     {
//         id: 4,
//         name: 'DPD Next Day Delivery',
//         price: 16.85,
//         message: 'This is not a guaranteed service'
//     }
// ]

export interface ORDER_RESPONSE_DATA {
    message: string;
    data: ORDER_LIST_RESPONSE;
}
export interface Payment_Validate {
    order_id: number;
    order_code: string;
    status: string;
    message: string;
}

export interface ORDER_LIST_RESPONSE {

    order_id: string;
    status: string;
    total: number;
    order_items: {
        product_name: string;
        quantity: number;
        total: number;
        variant: {
            variant_id: number;
            slug: string;
            price: string;
            weight: number | null;
            length: number | null;
            width: number | null;
            height: number | null;
            description: string | null;
        };
    }[];
    order_code: number;
    pricing: {
        subtotal: number;
        shipping_cost: number;
        discount: number;
        total: number;
    };
    shipping: {
        address: {
            id: number;
            updated_by: number;
            user_id: number;
            name: string;
            last_name: string;
            company_name: string | null;
            country: string;
            street: string;
            apartment: string | null;
            town: string; 
            region: string;
            post_code: string;
            phone: string | null;
            token: string | null;
            createdAt: string;
            updatedAt: string;
            deletedAt: string | null;
        };
    };

}


export interface ORDER_DETAILS_RESPONSE {
   order: ORDER;
   user: USER_ADDRESS_RESPONSE;
}
export interface ORDER {
    order_unique_id: string;
    total: string;
    discount_price: string | null;
    status: string;
    createdAt: string;
    order_code: string;
    email: string;
    phone: string;
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
            slug: string;
            ProductImages: {
                image_url: string;
            }[];
        };
        variant: {
            id: number;
            slug: string;
            price: string;
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
                image_url: string;
            }[];
        };
    }[];
    // shippingAddress: {
    //     name: string;
    //     last_name: string;
    //     street: string;
    //     town: string;
    //     post_code: string;
    //     phone: string | null;
    //     region: string;
    //     country: string;
    // } | null;
    // billingAddress: {
    //     name: string;
    //     last_name: string;
    //     street: string;
    //     town: string;
    //     post_code: string;
    //     phone: string | null;
    //     region: string;
    //     country: string
    // } | null;
    orderShippingAddress: {
        name: string;
        last_name: string;
        street: string;
        town: string;
        post_code: string;
        phone: string | null;
        region: string;
        country: string;
    };
    orderBillingAddress: {
        name: string;
        last_name: string;
        street: string;
        town: string;
        post_code: string;
        phone: string | null;
        region: string;
        country: string;
    };
    shippingMethod: {
        id: number;
        shipping_method: string;
        shipping_cost: number;
    };
    coupon: null;
}


export interface SHIPPING_METHOD_DATA {
    id: number;
    shipping_method: string;
    description: string;
    message: string;
    shipping_cost: number;
    api_key: string;
    api_secret: string;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;

}

export enum ORDER_STATUS {
    DRAFT = 'draft',
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    FAIL = 'fail',
    CANCEL = 'cancel',
    CANCELLED = 'cancelled',
    RETURN_REQUESTED = 'return_requested',
    RETURN_APPROVED = 'return_approved',
    RETURN_RECEIVED = 'return_received',
    REFUNDED = 'refunded'
}
 
export interface Coupon {
    id: number;
    code: string;
    description: string;
    discount_type: string;
    discount_value: string;
    minimum_purchase: string;
    maximum_discount: string;
    usage_limit: number;
    usage_count: number;
    is_single_use: boolean;
    start_date: string;
    end_date: string;
    status: string;
    created_by: number;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
}

export interface CouponResponse {
    totalItems: number;
    shippingCost: number;
    subTotal: number;
    total: number;
    coupon: Coupon;
}