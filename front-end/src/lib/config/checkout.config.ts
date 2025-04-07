import { z } from "zod"

 
export enum CHECKOUT_PAYMENT_METHODS {
    VIVA_WALLET = 'vivaWallet',
    WORLD_PAY = 'Worldpay'
}


export const CHECKOUT_FORM_SCHEMA = z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    ageConfirmation: z.boolean().refine(val => val === true, {
        message: 'You must be 18 or over to proceed'
    }),
    selectedAddressId: z.number().optional(),
    // Shipping Address - Make validation more lenient
    shippingFirstName: z.string().min(1, 'First name is required').optional().or(z.literal('')),
    shippingLastName: z.string().min(1, 'Last name is required').optional().or(z.literal('')),
    shippingAddress1: z.string().min(1, 'Address line 1 is required').optional().or(z.literal('')),
    shippingAddress2: z.string().optional(),
    shippingAddress3: z.string().optional(),
    shippingCity: z.string().min(1, 'City is required').optional().or(z.literal('')),
    shippingPostcode: z.string().min(1, 'Postcode is required').optional().or(z.literal('')),
    shippingRegion: z.string().min(1, 'Region is required').optional().or(z.literal('')),
    shippingCountry: z.string().min(1, 'Country is required').optional().or(z.literal('')),
    // Billing Address
    useShippingAsBilling: z.boolean(),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress1: z.string().optional(),
    billingAddress2: z.string().optional(),
    billingAddress3: z.string().optional(),
    billingCity: z.string().optional(),
    billingPostcode: z.string().optional(),
    billingRegion: z.string().optional(),
    billingCountry: z.string().optional(),
    // Payment
    paymentMethod: z.enum([CHECKOUT_PAYMENT_METHODS.VIVA_WALLET, CHECKOUT_PAYMENT_METHODS.WORLD_PAY]),  
    // Terms
    termsAgreement: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms and conditions'
    }),
    // Shipping Method must be a number and must be greater than 0
    shippingMethodId: z.number().min(1, 'Shipping method is required'),
    // Coupon
    couponCode: z.string().optional()
}).refine((data) => {
    // Only validate fields when there's a submission attempt
    if (!data.ageConfirmation) return true; // Skip validation if we're not at submission stage
    
    // For shipping fields
    const hasRequiredShippingFields = data.shippingFirstName && 
                                    data.shippingLastName && 
                                    data.shippingAddress1 && 
                                    data.shippingCity && 
                                    data.shippingPostcode && 
                                    data.shippingRegion && 
                                    data.shippingCountry;
    
    // For billing fields (only if not using shipping as billing)
    if (!data.useShippingAsBilling) {
        return hasRequiredShippingFields && 
               data.billingFirstName && 
               data.billingLastName && 
               data.billingAddress1 && 
               data.billingCity && 
               data.billingPostcode && 
               data.billingRegion && 
               data.billingCountry;
    }
    
    return hasRequiredShippingFields;
}, {
    message: 'Please fill in all required address fields',
    path: ['shippingAddress1']
});

export type CHECKOUT_FORM_TYPE = z.infer<typeof CHECKOUT_FORM_SCHEMA>;

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
