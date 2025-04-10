'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SHIPPING_METHOD } from '@/lib/config/order.config';
import { CHECKOUT_PAYLOAD, CHECKOUT_PAYMENT_METHODS } from '@/lib/config/checkout.config';
import { placeOrder } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { useVivaWallet } from '@/lib/hooks/useVivaWallet';
import { useWorldPay } from '@/lib/hooks/useWorldpay';

interface CheckoutContextType {
    selectedShippingMethod: SHIPPING_METHOD | null;
    setSelectedShippingMethod: (method: SHIPPING_METHOD) => void;
    handlePlaceOrder: (data: CHECKOUT_PAYLOAD) => Promise<void>;
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
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<SHIPPING_METHOD | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();
    const { initiatePayment: initiateVivaPayment } = useVivaWallet();
    const { initiatePayment: initiateWorldPayPayment } = useWorldPay();
     
    const handlePlaceOrder = async (data: CHECKOUT_PAYLOAD) => {
       
        try {
            setIsProcessing(true);
            const response = await placeOrder(data);
            console.log('response', response);
            if (response.status === ServerActionStatus.SUCCESS) {
                const orderData = response.data.data;
                if(data.payment_method.method === CHECKOUT_PAYMENT_METHODS.VIVA_WALLET) {
                    // Initiate Viva Wallet payment
                    await initiateVivaPayment({
                        amount: data.total,
                        orderReference: String(orderData.order_code),
                        customerEmail: data.email,
                        customerName: `${data.shipping_address.first_name} ${data.shipping_address.last_name}`,
                        orderDescription: `Order #${response.data.message}`
                    });
                } else if(data.payment_method.method === CHECKOUT_PAYMENT_METHODS.WORLD_PAY) {
                    // Initiate WorldPay Smart Checkout
                    await initiateWorldPayPayment({
                        amount: data.total,
                        currency: 'EUR', // Adjust based on your needs
                        orderReference: String(orderData.order_code),
                        customerEmail: data.email,
                        customerName: `${data.shipping_address.first_name} ${data.shipping_address.last_name}`,
                        orderDescription: `Order #${response.data.message}`,
                        returnUrl: `${window.location.origin}${ROUTES.PAYMENT_SUCCESS}`,
                        cancelUrl: `${window.location.origin}${ROUTES.PAYMENT_FAILED}`,
                        billingAddress: {
                            address1: data.billing_address.address_line_1,
                            address2: data.billing_address.address_line_2,
                            city: data.billing_address.city,
                            state: data.billing_address.region,
                            postalCode: data.billing_address.post_code,
                            country: data.billing_address.country,
                        },
                        shippingAddress: {
                            address1: data.shipping_address.address_line_1,
                            address2: data.shipping_address.address_line_2,
                            city: data.shipping_address.city,
                            state: data.shipping_address.region,
                            postalCode: data.shipping_address.post_code,
                            country: data.shipping_address.country,
                        }
                    });
                }
                // clearCart();
                
            } else {
                router.push(ROUTES.PAYMENT_FAILED);
            }
        } catch (error) {
            console.error('Place order error:', error);
            router.push(ROUTES.PAYMENT_FAILED);
        } finally {
            setIsProcessing(false);
        }
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