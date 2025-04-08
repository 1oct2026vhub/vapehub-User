export const WORLD_PAY_CONFIG = {
    TEST_MODE: process.env.NEXT_PUBLIC_WORLDPAY_TEST_MODE === 'true',
    MERCHANT_CODE: process.env.NEXT_PUBLIC_WORLDPAY_MERCHANT_CODE || '',
    INSTALLATION_ID: process.env.NEXT_PUBLIC_WORLDPAY_INSTALLATION_ID || '',
    PAYMENT_URL: process.env.NEXT_PUBLIC_WORLDPAY_PAYMENT_URL || 'https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp',
    SMART_CHECKOUT_URL: process.env.NEXT_PUBLIC_WORLDPAY_SMART_CHECKOUT_URL || 'https://secure-test.worldpay.com/smartcheckout/',
    SCRIPT_URL: process.env.NEXT_PUBLIC_WORLDPAY_SCRIPT_URL || 'https://secure-test.worldpay.com/smartcheckout/script.js',
};

export const WORLD_PAY_PAYMENT_STATUS = {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    PENDING: 'PENDING',
} as const;

export interface WorldPayPaymentPayload {
    amount: number;
    currency: string;
    orderReference: string;
    customerEmail: string;
    customerName: string;
    orderDescription: string;
    returnUrl: string;
    cancelUrl: string;
    billingAddress?: {
        address1: string;
        address2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
    };
    shippingAddress?: {
        address1: string;
        address2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
    };
} 