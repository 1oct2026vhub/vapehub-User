import { useState } from 'react'; 

interface VivaWalletConfig {
    apiBaseUrl: string;
}

interface VivaWalletPaymentParams {
    orderReference: string;
}

export const useVivaWallet = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const config: VivaWalletConfig = {       
        apiBaseUrl: process.env.VIVA_WALLET_API_BASE_URL || 'https://demo.vivapayments.com/web/checkout',
    };

    const initiatePayment = async (params: VivaWalletPaymentParams) => {
        try {
            setIsProcessing(true);
            setError(null);

            const checkoutURL = new URL(config.apiBaseUrl);
            
            // Required parameters
            checkoutURL.searchParams.append('ref', params.orderReference);
            checkoutURL.searchParams.append('color', '2e9970');
             
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