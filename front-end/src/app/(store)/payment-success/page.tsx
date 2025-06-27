'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { ServerActionStatus } from '@/lib/config/app.config';
import { getTransactionDetails, worldpayPaymentSuccess } from '@/lib/server.actions';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

const PaymentSuccessPage = () => {
    const router = useRouter();
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

    // Log transaction details changes
    useEffect(() => {
        console.log('=== TRANSACTION DETAILS STATE UPDATED ===');
        console.log('Current transaction details:', transactionDetails);
        console.log('=========================================');
    }, [transactionDetails]);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get parameters from URL
                const transactionId = searchParams.get('t');
                const sessionId = searchParams.get('s');
                const orderCode = searchParams.get('orderCode');
                const currency = searchParams.get('currency');
                const amount = searchParams.get('amount');
                
                // Log all URL parameters
                console.log('=== PAYMENT SUCCESS PAGE - URL PARAMETERS ===');
                console.log('transactionId:', transactionId);
                console.log('sessionId:', sessionId);
                console.log('orderCode:', orderCode);
                console.log('currency:', currency);
                console.log('amount:', amount);
                console.log('All search params:', Object.fromEntries(searchParams.entries()));
                console.log('================================================');
                
                // Check if this is a Worldpay payment (has orderCode, currency, amount)
                const isWorldpayPayment = orderCode && currency && amount;
                // Check if this is a Viva Wallet payment (has transactionId and sessionId)
                const isVivaWalletPayment = transactionId && sessionId;
                
                console.log('Payment type detection:');
                console.log('isWorldpayPayment:', isWorldpayPayment);
                console.log('isVivaWalletPayment:', isVivaWalletPayment);
                
                if (!isWorldpayPayment && !isVivaWalletPayment) {
                    console.error('Missing required payment parameters for both Worldpay and Viva Wallet');
                    throw new Error('Missing required payment parameters');
                }

                // If Worldpay parameters are present, call Worldpay success API
                if (isWorldpayPayment) {
                    console.log('=== WORLDPAY PAYMENT SUCCESS API CALL ===');
                    const worldpayPayload = {
                        orderCode,
                        currency,
                        amount: parseFloat(amount)
                    };
                    console.log('Worldpay API Payload:', worldpayPayload);
                    
                    const worldpayResponse = await worldpayPaymentSuccess(worldpayPayload);
                    
                    console.log('Worldpay API Response Status:', worldpayResponse.status);
                    console.log('Worldpay API Response Data:', worldpayResponse.status === ServerActionStatus.SUCCESS ? worldpayResponse.data : worldpayResponse.errorData);
                    console.log('Worldpay API Response Message:', worldpayResponse.status === ServerActionStatus.ERROR ? worldpayResponse.message : 'Success');
                    console.log('Full Worldpay API Response:', worldpayResponse);
                    console.log('==========================================');

                    if (worldpayResponse.status === ServerActionStatus.SUCCESS) {
                        console.log('Worldpay payment success - clearing cart');
                        console.log('Cart state before clearing:', { clearCart });
                        // Clear cart and coupons after successful payment
                        clearCart();
                        console.log('Cart cleared successfully after Worldpay payment');
                        
                        const newTransactionDetails = {
                            id: orderCode, // Use orderCode for Worldpay
                            method: 'Worldpay',
                            amount: parseFloat(amount)
                        };
              
                        console.log('Setting transaction details for Worldpay:', newTransactionDetails);
                        setTransactionDetails(prev => ({
                            ...prev,
                            ...newTransactionDetails
                        }));
                        
                        toast.success('Payment processed successfully!');
                        console.log('Worldpay payment processing completed successfully');
                        return;
                    } else {
                        console.error('Worldpay API error:', worldpayResponse.message);
                        throw new Error(worldpayResponse.message);
                    }
                }

                // Fallback to existing transaction details API for Viva Wallet
                if (isVivaWalletPayment) {
                    console.log('=== VIVA WALLET TRANSACTION DETAILS API CALL ===');
                    console.log('Calling getTransactionDetails with transactionId:', transactionId);
                    
                    const response = await getTransactionDetails(transactionId);
                    
                    console.log('Transaction Details API Response Status:', response.status);
                    console.log('Transaction Details API Response Data:', response.status === ServerActionStatus.SUCCESS ? response.data : response.errorData);
                    console.log('Transaction Details API Response Message:', response.status === ServerActionStatus.ERROR ? response.message : 'Success');
                    console.log('Full Transaction Details API Response:', response);
                    console.log('===============================================');
                    
                    if (response.status === ServerActionStatus.SUCCESS) {
                        console.log('Viva Wallet transaction details success - clearing cart');
                        console.log('Cart state before clearing:', { clearCart });
                        // Clear cart and coupons after successful payment
                        clearCart();
                        console.log('Cart cleared successfully after Viva Wallet transaction details verification');
                        
                        const newTransactionDetails = {
                            id: transactionId, // Use transactionId for Viva Wallet
                            method: response.data.payment_method,
                            amount: response.data.amount
                        };
                        
                        console.log('Setting transaction details for Viva Wallet:', newTransactionDetails);
                        // Set transaction details
                        setTransactionDetails(prev => ({
                            ...prev,
                            ...newTransactionDetails
                        })); 
                    } else {
                        console.error('Viva Wallet transaction details API error:', response.message);
                        throw new Error(response.message);
                    }
                }
            } catch (error) {
                console.error('=== PAYMENT VERIFICATION ERROR ===');
                console.error('Error type:', typeof error);
                console.error('Error message:', (error as Error)?.message);
                console.error('Error stack:', (error as Error)?.stack);
                console.error('Full error object:', error);
                console.error('===================================');
                
                toast.error('Failed to verify payment. Please contact support.');
                // router.push(ROUTES.PAYMENT_FAILED);
            }
        };

        console.log('=== PAYMENT SUCCESS PAGE MOUNTED ===');
        console.log('Current URL:', window.location.href);
        console.log('Search params string:', searchParams.toString());
        console.log('====================================');
        
        verifyPayment();
    }, [router, searchParams, clearCart]);

    useEffect(() => {
        console.log('=== SESSION STATUS CHECK ===');
        console.log('Session status:', status);
        console.log('============================');
        
        if (status === 'unauthenticated') {
            console.log('User unauthenticated, redirecting to account page');
            router.replace(ROUTES.MY_ACCOUNT);
        }
    }, [status, router]);

    if (status === 'loading') {
        console.log('Session loading...');
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        console.log('Session unauthenticated, showing redirect message');
        return <div>Redirecting to login...</div>;
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
                    <h1 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold">Puff, Paid, Perfect!</h1>
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

                <Button
                    as={Link}
                    href={ROUTES.MY_ACCOUNT_ORDERS}
                    size="lg"
                    radius="md"
                    color="primary"
                    className="btn primary-btn shadow-input text-content-1 !font-medium h-11 mx-auto"
                >
                    View Orders
                </Button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage; 