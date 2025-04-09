import { z } from "zod"

 
export enum CHECKOUT_PAYMENT_METHODS {
    VIVA_WALLET = 'VivaWallet',
    WORLD_PAY = 'Worldpay'
}


export const CHECKOUT_FORM_SCHEMA = (useShippingAsBilling: boolean) => z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    ageConfirmation: z.boolean().refine(val => val === true, {
        message: 'You must be 18 or over to proceed'
    }),
    selectedAddressId: z.number().optional(),
    // Shipping Address - Make validation more lenient
    shippingFirstName: z.string().min(1, 'First name is required').max(50, 'First name must not exceed 50 characters'),
    shippingLastName: z.string().min(1, 'Last name is required').max(50, 'Last name must not exceed 50 characters'),
    shippingAddress1: z.string().min(1, 'Address line 1 is required').max(255, 'Address line 1 must not exceed 255 characters'),
    shippingAddress2: z.string().optional(),
    shippingAddress3: z.string().optional(),
    shippingCity: z.string().min(1, 'City is required'),
    shippingPostcode: z.string().min(1, "Postcode is required")
    .max(20, "Postcode must not exceed 20 characters")
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      "Please enter a valid UK postcode"
    ),
    shippingRegion: z.string().min(1, 'Region is required'),
    shippingCountry: z.string().min(1, 'Country is required'),
    // Billing Address
    useShippingAsBilling: z.boolean(),
    billingFirstName: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'First name is required'),
    billingLastName: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'Last name is required'),
    billingAddress1: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'Address line 1 is required'),
    billingAddress2: z.string().optional(),
    billingAddress3: z.string().optional(),
    billingCity: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'City is required'),
    billingPostcode: useShippingAsBilling ? z.string().optional() : z.string().min(1, "Postcode is required")
    .max(20, "Postcode must not exceed 20 characters")
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      "Please enter a valid UK postcode"
    ),
    billingRegion: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'Region is required'),
    billingCountry: useShippingAsBilling ? z.string().optional() : z.string().min(1, 'Country is required'),
    // Payment
    paymentMethod: z.enum([CHECKOUT_PAYMENT_METHODS.VIVA_WALLET, CHECKOUT_PAYMENT_METHODS.WORLD_PAY]),  
    // Terms
    termsAgreement: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms and conditions'
    }),
    // Shipping Method must be a number and must be greater than 0
    shippingMethodId: z.string().min(1, 'Shipping method is required'),
    // Coupon
    couponCode: z.string().optional(),
    marketingConsent: z.boolean().optional()
});

export type CHECKOUT_FORM_TYPE = z.infer<ReturnType<typeof CHECKOUT_FORM_SCHEMA>>;

export const APPLY_COUPON_FORM_SCHEMA = z.object({
    couponCode: z.string().optional(),
    shippingMethodId: z.number().optional()
});

export type APPLY_COUPON_FORM_TYPE = z.infer<typeof APPLY_COUPON_FORM_SCHEMA>;

export interface APPLY_COUPON_PAYLOAD {
    couponCode: string;
    shippingMethodId: number;
}

export interface CHECKOUT_PAYLOAD {
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
