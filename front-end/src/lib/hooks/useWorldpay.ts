import { useState, useEffect } from 'react';
import { WORLD_PAY_CONFIG, WorldPayPaymentPayload } from '@/lib/config/worldpay.config';
 
declare global {
    interface Window {
        Worldpay: {
            new (config: { clientKey: string; environment: string }): {
                openSmartCheckout: (request: unknown) => Promise<void>;
            };
        };
    }
}

export const useWorldPay = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [worldpayLoaded, setWorldpayLoaded] = useState(false);

    useEffect(() => {
        // Load Worldpay Smart Checkout script
        const script = document.createElement('script');
        script.src = WORLD_PAY_CONFIG.SCRIPT_URL;
        script.async = true;
        script.onload = () => setWorldpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initiatePayment = async (payload: WorldPayPaymentPayload) => {
        if (!worldpayLoaded) {
            throw new Error('Worldpay Smart Checkout script not loaded');
        }

        setIsProcessing(true);
        try {
            // Initialize Worldpay Smart Checkout
            const worldpay = new window.Worldpay({
                clientKey: WORLD_PAY_CONFIG.INSTALLATION_ID,
                environment: WORLD_PAY_CONFIG.TEST_MODE ? 'test' : 'production',
            });

            // Create payment request
            const paymentRequest = {
                amount: payload.amount,
                currency: payload.currency,
                orderDescription: payload.orderDescription,
                customerOrderCode: payload.orderReference,
                name: payload.customerName,
                email: payload.customerEmail,
                billingAddress: payload.billingAddress,
                shippingAddress: payload.shippingAddress,
                successUrl: payload.returnUrl,
                cancelUrl: payload.cancelUrl,
                failureUrl: payload.cancelUrl,
            };

            // Open Smart Checkout modal
            await worldpay.openSmartCheckout(paymentRequest);

        } catch (error) {
            console.error('Worldpay Smart Checkout error:', error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        initiatePayment,
        isProcessing,
        worldpayLoaded,
    };
}; 