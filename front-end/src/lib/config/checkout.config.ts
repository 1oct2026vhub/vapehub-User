import { z } from "zod"

export type CHECKOUT_PAYLOAD = {
    couponCode: string, 
}

export type APPLY_COUPON_PAYLOAD = {
    couponCode: string, 
    shippingMethodId?: number,
}

// Apply Coupon form schema
export const APPLY_COUPON_FORM_SCHEMA = z.object({
    couponCode: z.string().optional(),
    shippingMethodId: z.number().optional(),
})

export type APPLY_COUPON_FORM_SCHEMA = z.infer<typeof APPLY_COUPON_FORM_SCHEMA>
