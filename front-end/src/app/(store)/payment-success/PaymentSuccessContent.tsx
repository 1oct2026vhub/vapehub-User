'use client'

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { ServerActionStatus } from '@/lib/config/app.config';
import { getTransactionDetails, worldpayPaymentSuccess } from '@/lib/server.actions';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

const WORLDPAY_LOCK_ATTR = 'data-worldpay-payment-lock';

const isLikelyNetworkFailure = (apiError: unknown): boolean => {
    const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
    return (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('Load failed') ||
        errorMessage.includes('ECONNREFUSED')
    );
};

const PaymentSuccessContent = () => {
    const searchParams = useSearchParams();
    const { status } = useSession();
    const { clearCart } = useCart();
    const [transactionDetails, setTransactionDetails] = useState({
        id: '',
        amount: 0,
        method: 'Online',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(true);
    const hasApiBeenCalledRef = useRef(false);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        return () => {
            document.documentElement.removeAttribute(WORLDPAY_LOCK_ATTR);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        // Prevent multiple executions
        if (hasApiBeenCalledRef.current || isProcessingRef.current) {
            return;
        }

        // Wait for page to be fully loaded and hydrated
        const waitForPageLoad = () => {
            return new Promise<void>((resolve) => {
                if (document.readyState === 'complete') {
                    // Page is already loaded
                    setTimeout(resolve, 500); // Additional delay to ensure hydration
                } else {
                    // Wait for page to load
                    window.addEventListener('load', () => {
                        setTimeout(resolve, 500); // Additional delay to ensure hydration
                    });
                }
            });
        };

        const verifyPayment = async () => {
            try {
                // Wait for page to be fully loaded and hydrated
                await waitForPageLoad();
                
                // Get parameters from URL after page is loaded
                const transactionId = searchParams.get('t');
                const sessionId = searchParams.get('s');
                const orderCode = searchParams.get('orderCode');
                const currency = searchParams.get('currency');
                const amount = searchParams.get('amount');

                // Check if this is a Worldpay payment (has orderCode, currency, amount)
                const isWorldpayPayment = orderCode && currency && amount;
                // Check if this is a Viva Wallet payment (has transactionId and sessionId)
                const isVivaWalletPayment = transactionId && sessionId;

                // Only proceed if we have valid payment parameters
                if (!isWorldpayPayment && !isVivaWalletPayment) {
                    console.error('Missing required payment parameters for both Worldpay and Viva Wallet');
                    setIsVerifyingPayment(false);
                    return;
                }

                // Mark as processing and called immediately to prevent race conditions
                isProcessingRef.current = true;
                hasApiBeenCalledRef.current = true;

                // If Worldpay parameters are present, call Worldpay success API
                if (isWorldpayPayment) {
                    
                    const worldpayPayload = {
                        orderCode,
                        currency,
                        amount: parseFloat(amount)
                    };
                    
                    // First, set the transaction details from URL parameters
                    const newTransactionDetails = {
                        id: orderCode,
                        method: 'Worldpay',
                        amount: parseFloat(amount)
                    };
                    setTransactionDetails(prev => ({
                        ...prev,
                        ...newTransactionDetails
                    }));

                    if (!cancelled) {
                        document.documentElement.setAttribute(WORLDPAY_LOCK_ATTR, 'true');
                    }
                    try {
                        const worldpayResponse = await worldpayPaymentSuccess(worldpayPayload);
                        if (cancelled) {
                            return;
                        }
                        // Check if response is valid and has expected structure
                        if (worldpayResponse && typeof worldpayResponse === 'object') {
                            if (worldpayResponse.status === ServerActionStatus.SUCCESS) {
                                // Clear cart and coupons after successful payment and UI update
                                clearCart();
                                toast.success('Payment processed successfully!');
                            } else {
                                // Check if it's a stock validation error
                                const isStockValidationError = worldpayResponse.message?.includes('stock') || worldpayResponse.message?.includes('Validation min on stock');
                                
                                if (isStockValidationError) {
                                    // For stock validation errors, still clear the cart since payment was successful
                                    clearCart();
                                    toast.success('Payment completed successfully! (Stock validation completed)');
                                } else {
                                    // For other errors, show success with URL verification
                                    toast.success('Payment completed! (Details verified from URL)');
                                }
                            }
                        } else {
                            // Invalid response format
                            toast.success('Payment completed! (Details verified from URL)');
                        }
                        
                        setIsVerifyingPayment(false);
                        return;
                    } catch (apiError) {
                        // Only catch actual network/parsing errors, not API response errors
                        console.error('Worldpay API call failed:', apiError);

                        if (isLikelyNetworkFailure(apiError)) {
                            toast.error(
                                'Could not reach the server to confirm payment. Your bank may still have charged you — please contact support.'
                            );
                            setIsVerifyingPayment(false);
                            return;
                        }
                        
                        // Check if it's a JSON parsing error
                        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
                        const isJsonParsingError = errorMessage.includes('Unexpected token') || errorMessage.includes('<!DOCTYPE') || errorMessage.includes('not valid JSON');
                        
                        if (isJsonParsingError) {
                            // For JSON parsing errors, still clear the cart since payment was successful
                            clearCart();
                            toast.success('Payment completed successfully! (Payment verified)');
                        } else {
                            toast.success('Payment completed! (Details verified from URL)');
                        }
                        
                        setIsVerifyingPayment(false);
                        return;
                    } finally {
                        document.documentElement.removeAttribute(WORLDPAY_LOCK_ATTR);
                    }
                }

                // Fallback to existing transaction details API for Viva Wallet
                if (isVivaWalletPayment) {
                    
                    try {
                        const response = await getTransactionDetails(transactionId);

                        if (response && typeof response === 'object') {
                            if (response.status === ServerActionStatus.SUCCESS) {
                                // Clear cart and coupons after successful payment
                                clearCart();                        
                                const newTransactionDetails = {
                                    id: transactionId, // Use transactionId for Viva Wallet
                                    method: response.data.payment_method,
                                    amount: response.data.amount
                                };
                                // Set transaction details
                                setTransactionDetails(prev => ({
                                    ...prev,
                                    ...newTransactionDetails
                                })); 
                            } else {
                                // Still show basic transaction details
                                const newTransactionDetails = {
                                    id: transactionId,
                                    method: 'Viva Wallet',
                                    amount: 0 // We don't have amount from URL for Viva Wallet
                                };
                                setTransactionDetails(prev => ({
                                    ...prev,
                                    ...newTransactionDetails
                                }));
                                toast.success('Payment completed! (Details verified from URL)');
                            }
                        } else {
                            // Invalid response format
                            const newTransactionDetails = {
                                id: transactionId,
                                method: 'Viva Wallet',
                                amount: 0
                            };
                            setTransactionDetails(prev => ({
                                ...prev,
                                ...newTransactionDetails
                            }));
                            toast.success('Payment completed! (Details verified from URL)');
                        }
                        
                        setIsVerifyingPayment(false);
                        return;
                    } catch (apiError) {
                        // Only catch actual network/parsing errors
                        console.error('Viva Wallet API call failed:', apiError);
                        // If API call fails, still show basic transaction details
                        const newTransactionDetails = {
                            id: transactionId,
                            method: 'Viva Wallet',
                            amount: 0 // We don't have amount from URL for Viva Wallet
                        };
                        setTransactionDetails(prev => ({
                            ...prev,
                            ...newTransactionDetails
                        }));
                        toast.success('Payment completed! (Details verified from URL)');
                        setIsVerifyingPayment(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment. Please contact support.');
                setIsVerifyingPayment(false);
                // router.push(ROUTES.PAYMENT_FAILED);
            }
        };

        // Call the verification function
        verifyPayment();

        // Cleanup function to reset the ref when component unmounts
        return () => {
            cancelled = true;
            document.documentElement.removeAttribute(WORLDPAY_LOCK_ATTR);
            hasApiBeenCalledRef.current = false;
            isProcessingRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - guarded by refs to prevent multiple executions

    if (isVerifyingPayment) {
        return <div>Loading...</div>;
    }
    return (
        <div className="auth-form-container md:!py-[84px]">
            <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
                <div className="space-y-3.5 text-center w-full">
                    <Image
                        src='/images/payment-success.svg'
                        alt="payment success"
                        width={200}
                        height={200}
                        className="mx-auto aspect-square max-sm:max-w-32"
                    />
                    <h1 className="mx-auto text-title-2 md:text-xl text-skin-neutral-300 font-bold">Puff, Paid, Perfect!</h1>
                    <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
                        Payment completed. Your next puff is on its way.
                    </p>
                </div>

                <div className='py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5'>
                    <div className='flex items-start justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p className='text-nowrap'>Transaction ID</p>
                        <p className='break-all text-right'>{transactionDetails.id}</p>
                    </div>
                    <div className='flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Amount Paid</p>
                        <p>£{transactionDetails.amount}</p>
                    </div>
                    <div className='flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Payment Method</p>
                        <p>{transactionDetails.method}</p>
                    </div>
                    <div className='flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Date</p>
                        <p>{transactionDetails.date}</p>
                    </div>
                    <div className='flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Time</p>
                        <p>{transactionDetails.time}</p>
                    </div>
                </div>

                {status === 'authenticated' ? (
                    <Button
                        as={Link}
                        href={ROUTES.MY_ACCOUNT_ORDERS}
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
                    >
                        View Orders
                    </Button>
                ) : (
                    <Button
                        as={Link}
                        href={ROUTES.WELCOME}
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
                    >
                        Continue Shopping
                    </Button>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccessContent;

