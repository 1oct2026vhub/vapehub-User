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

export interface WorldPayOrderData {
    order_code: string;
    worldpay_url: string;
    // Include other properties from the nested 'data' object if needed
}

export interface GuestCheckoutResponseData {
    checkout: {
        totalItems: number;
        shippingCost: number;
        subTotal: number;
        total: number;
        deals: {
            total_deals_discount: number;
            applicable_deals: unknown[];
        };
        mail_subscription_data: unknown | null;
        loyalty_redemption_info: {
            user_points: number;
            minimum_points_required: number;
            can_redeem: boolean;
            points_needed: number;
            redemption_amount: number;
            redemption_type: string;
            points_value: string;
            min_amount_for_loyalty_points: string;
            amount_divisor: string;
        };
    };
    order: {
        order_code: string;
        worldpay_url: string;
        order_details: unknown;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    is_temporary: boolean;
}

export interface ORDER_RESPONSE_DATA {
    message: string;
    data: ORDER_LIST_RESPONSE | WorldPayOrderData;
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

export interface REFERRAL {
    coupon_code: string;
    coupon_value: string;
    coupon_type: string;
    coupon_discount: number;
}

export interface ORDER_DETAILS_RESPONSE {
   order: ORDER;
   user: USER_ADDRESS_RESPONSE;
   referral: REFERRAL;
   
}
export interface OrderItems {
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
    orderItems: OrderItems[];
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
    paymentMethod: {
        payment_method: string;
        status: string;
    } | null;
    coupon: null;
}


export interface SHIPPING_METHOD_DATA {
    id: number;
    shipping_method: string;
    shipping_cost: string;
    service_code: string;
    carrier_code: string;
    api_key: string | null;
    api_secret: string | null;
    description: string;
    method_order: number;
    is_enabled: boolean;
    display_text: string;
    requestedShippingService: string;
    updated_by: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface SHIPPING_METHOD_DISPLAY {
    id: number;
    display_text: string;
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
    OUT_FOR_DELIVERY = 'out_for_delivery',
    RETURN_REQUESTED = 'return_requested',
    RETURN_APPROVED = 'return_approved',
    RETURN_RECEIVED = 'return_received',
    REFUNDED = 'refunded', 
}


export const OrderStatus = [
    { name: ORDER_STATUS.DRAFT, label: 'Draft' },
    { name: ORDER_STATUS.PENDING, label: 'Pending' },
    { name: ORDER_STATUS.PROCESSING, label: 'Processing' },
    { name: ORDER_STATUS.SHIPPED, label: 'Shipped' },
    { name: ORDER_STATUS.DELIVERED, label: 'Delivered' },
    { name: ORDER_STATUS.COMPLETED, label: 'Completed' },
    { name: ORDER_STATUS.FAIL, label: 'Failed' },
    { name: ORDER_STATUS.CANCEL, label: 'Cancelled' },
    { name: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
    { name: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
    { name: ORDER_STATUS.RETURN_REQUESTED, label: 'Return Requested' },
    { name: ORDER_STATUS.RETURN_APPROVED, label: 'Return Approved' },
    { name: ORDER_STATUS.RETURN_RECEIVED, label: 'Return Received' },
    { name: ORDER_STATUS.REFUNDED, label: 'Refunded' }
];

 
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
    referral_value: number;
    referral_value_type: "percentage" | "fixed";
    mail_subscription_data: {
        discount_amount: number;
        discount_type: string;
        isDiscountUsed: boolean;
    };
}

export interface REVIEW_ORDER_PAYLOAD {
    order_id: number;
    product_id: number;
    company_name: string;
    rating: number;
    comment: string;
} 
export interface REVIEW_ORDER_PAYLOAD_UPDATE {
    media_id: number;
    company_name: string;
    rating: number;
    comment: string;
    is_visible: boolean;
}
export interface REVIEW_ORDER_DATA {
    rows: {
    id: number;
    user_id: number;
    order_id: number;
    product_id: number;
    company_name: string;
    rating: number;
    comment: string;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        profile_pic_url: string | null;
    };
    order: {
        id: number;
        order_unique_id: string;
    };
    product: {
        id: number;
        name: string;
        slug: string;
    };
    media: unknown[];
    }[];
    pagination: {
        total: number;
        page: number; 
        totalPages: number;
    };

}
export interface REVIEWS {
    id: number;
    user_id: number | null;
    order_id: number | null;
    product_id: number;
    company_name: string;
    rating: number;
    comment: string;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
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
    product: {
        id: number;
        name: string;
        slug: string;
    };
    media: unknown[];
    verified_by: boolean;
    user_name: string | null;
}
export interface REVIEW_ORDER_RESPONSE {
    reviews: REVIEWS[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    average_rating: string;
    total_reviews: number;
}
 
