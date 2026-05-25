'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CHECKOUT_PAYLOAD, CHECKOUT_PAYMENT_METHODS } from '@/lib/config/checkout.config';
// import { ROUTES } from '@/lib/routes';
import { useVivaWallet } from '@/lib/hooks/useVivaWallet';
// import { useWorldPay } from '@/lib/hooks/useWorldpay';
import { toast } from 'sonner';
import { ORDER_RESPONSE_DATA, SHIPPING_METHOD_DATA } from '../config/order.config';
import { resolvePlaceOrderRedirectUrl } from '../utils/checkout-order.utils';

interface CheckoutContextType {
    selectedShippingMethod: SHIPPING_METHOD_DATA | null;
    setSelectedShippingMethod: (method: SHIPPING_METHOD_DATA) => void;
    /** `true` only when a payment redirect was started (or equivalent); callers should not reset the form on `false`. */
    handlePlaceOrder: (data: CHECKOUT_PAYLOAD, response: ORDER_RESPONSE_DATA) => Promise<boolean>;
    isProcessing: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};

interface CheckoutProviderProps {
    children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<SHIPPING_METHOD_DATA | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { initiatePayment: initiateVivaPayment } = useVivaWallet();
    // const { initiatePayment: initiateWorldPayPayment } = useWorldPay();

    const handlePlaceOrder = async (data: CHECKOUT_PAYLOAD, response: ORDER_RESPONSE_DATA): Promise<boolean> => { 
        try {
            setIsProcessing(true);
           
            // Check if response.data exists
            if (!response || !response.data) {
                console.error('❌ [handlePlaceOrder] Invalid response data:', response);
                toast.error('Invalid order response. Please try again.');
                return false;
            }

            const orderData = response.data;            
            if(data.payment_method.method === CHECKOUT_PAYMENT_METHODS.VIVA_WALLET) {
                // Initiate Viva Wallet payment
                if (orderData && typeof orderData === 'object' && 'order_code' in orderData) {
                    await initiateVivaPayment({                        
                        orderReference: String((orderData as { order_code: string | number }).order_code)
                    });
                    return true;
                } else {
                    console.error('Invalid order data for VivaWallet:', orderData);
                    toast.error('Invalid order data. Please try again.');
                    return false;
                }
            } else if(data.payment_method.method === CHECKOUT_PAYMENT_METHODS.WORLD_PAY) {
                // // Initiate WorldPay Smart Checkout
                // await initiateWorldPayPayment({
                //     amount: data.total,
                //     currency: 'EUR', // Adjust based on your needs
                //     orderReference: String(orderData.order_code),
                //     customerEmail: data.email,
                //     customerName: `${data.shipping_address.first_name} ${data.shipping_address.last_name}`,
                //     orderDescription: `Order #${response.message}`,
                //     returnUrl: `${window.location.origin}${ROUTES.PAYMENT_SUCCESS}`,
                //     cancelUrl: `${window.location.origin}${ROUTES.PAYMENT_FAILED}`,
                //     billingAddress: {
                //         address1: data.billing_address.address_line_1,
                //         address2: data.billing_address.address_line_2,
                //         city: data.billing_address.city,
                //         state: data.billing_address.region,
                //         postalCode: data.billing_address.post_code,
                //         country: data.billing_address.country,
                //     },
                //     shippingAddress: {
                //         address1: data.shipping_address.address_line_1,
                //         address2: data.shipping_address.address_line_2,
                //         city: data.shipping_address.city,
                //         state: data.shipping_address.region,
                //         postalCode: data.shipping_address.post_code,
                //         country: data.shipping_address.country,
                //     }
                // });
              // WorldPay URL when payment is required; otherwise payment_success_url (e.g. loyalty zero-total).
                const redirectUrl = resolvePlaceOrderRedirectUrl(orderData);
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                    return true;
                }
                console.error('Payment redirect URL not found in order data:', orderData);
                toast.error('Payment redirect URL not found. Please try again.');
                return false;
            }
            // clearCart();
                 
        } catch (error) {
            console.error('Place order error:', error);
            toast.error('An error occurred while placing your order. Please try again.');
            // router.push(ROUTES.PAYMENT_FAILED);
            return false;
        } finally {
            setIsProcessing(false);
        }
        return false;
    };
    

    const value = {
        selectedShippingMethod,
        setSelectedShippingMethod,
        handlePlaceOrder,
        isProcessing
    };

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
}; 