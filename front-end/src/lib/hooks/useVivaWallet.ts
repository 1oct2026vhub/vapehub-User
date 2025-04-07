import { useState } from 'react';
import { ROUTES } from '@/lib/routes';

interface VivaWalletConfig {
    merchantId: string;
    merchantSourceCode: string;
    apiBaseUrl: string;
}

interface VivaWalletPaymentParams {
    amount: number;
    orderReference: string;
    customerEmail?: string;
    customerName?: string;
    orderDescription?: string;
}

export const useVivaWallet = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const config: VivaWalletConfig = {
        merchantId: process.env.VIVA_WALLET_MERCHANT_ID || '',
        merchantSourceCode: process.env.VIVA_WALLET_MERCHANT_SOURCE_CODE || '',
        apiBaseUrl: process.env.VIVA_WALLET_API_BASE_URL || 'https://demo.vivapayments.com/web/checkout',
    };

    const initiatePayment = async (params: VivaWalletPaymentParams) => {
        try {
            setIsProcessing(true);
            setError(null);

            const checkoutURL = new URL(config.apiBaseUrl);
            
            // Required parameters
            checkoutURL.searchParams.append('ref', params.orderReference);
            checkoutURL.searchParams.append('merchantId', config.merchantId);
            checkoutURL.searchParams.append('sourcecode', config.merchantSourceCode);
            checkoutURL.searchParams.append('amount', params.amount.toString());
            
            // Optional parameters
            if (params.customerEmail) checkoutURL.searchParams.append('customerEmail', params.customerEmail);
            if (params.customerName) checkoutURL.searchParams.append('customerName', params.customerName);
            if (params.orderDescription) checkoutURL.searchParams.append('customerTrns', params.orderDescription);
            
            // Redirect URLs
            checkoutURL.searchParams.append('resultUrl', `${window.location.origin}${ROUTES.PAYMENT_SUCCESS}`);
            checkoutURL.searchParams.append('failUrl', `${window.location.origin}${ROUTES.PAYMENT_FAILED}`);
            
            // Payment options
            checkoutURL.searchParams.append('paymentTimeout', '300');
            checkoutURL.searchParams.append('paymentMethod', '0');
            
            // Store reference in local storage for verification on return
            localStorage.setItem('vivaOrderRef', params.orderReference);
            
            // Redirect to Viva Wallet checkout
            window.location.href = checkoutURL.toString();
            
        } catch (error) {
            console.error('Viva Wallet payment error:', error);
            setError('Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    return {
        initiatePayment,
        isProcessing,
        error
    };
}; 