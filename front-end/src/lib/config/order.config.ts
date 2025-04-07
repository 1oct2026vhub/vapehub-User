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
        variantImages: {image_url: string}[];
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
export const SHIPPING_METHODS: SHIPPING_METHOD[] = [
    {
        id: 1,
        name: 'Royal Mail Tracked 48',
        description: '2 to 4 working days',
        message: 'Free for orders over £30',
        price: 10.02
    },
    {
        id: 2,
        name: 'Royal Mail Tracked 24',
        description: '1 to 2 working days',
        price: 12.22
    },
    {
        id: 3,
        name: 'Royal Mail Next Day Guaranteed',
        price: 15.59
    },
    {
        id: 4,
        name: 'DPD Next Day Delivery',
        price: 16.85, 
        message: 'This is not a guaranteed service'
    }
]

export interface ORDER_RESPONSE_DATA {
    message: string;
    data: {
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
            description: string;
        };
    }[];
    pricing: {
        subtotal: number;
        shipping_cost: number;
        discount: number;
        total: number;
    };
    shipping: {
        address: {
            id: number;
            user_id: number;
            last_name: string;
            country: string;
            post_code: string;
            name: string;
            street: string;
            town: string;
            updated_by: number;
            updatedAt: string;
            createdAt: string;
        };
        };
    }
}
