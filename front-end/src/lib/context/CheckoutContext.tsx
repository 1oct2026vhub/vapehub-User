'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SHIPPING_METHOD } from '@/lib/config/order.config';
import { CHECKOUT_PAYLOAD } from '@/lib/config/checkout.config';
import { placeOrder } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { useVivaWallet } from '@/lib/hooks/useVivaWallet';
import { useCart } from './CartContext';

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
    const { initiatePayment } = useVivaWallet();
    const { cartTotal, clearCart } = useCart();

    const handlePlaceOrder = async (data: CHECKOUT_PAYLOAD) => {
       
        try {
            setIsProcessing(true);
            const response = await placeOrder(data); 
        
            if (response.status === ServerActionStatus.SUCCESS) {
                // Initiate Viva Wallet payment
                await initiatePayment({
                    amount: cartTotal,
                    orderReference: response.data.data.order_id,
                    customerEmail: data.email,
                    customerName: `${data.shipping_address.first_name} ${data.shipping_address.last_name}`,
                    orderDescription: `Order #${response.data.message}`
                });
                clearCart();
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