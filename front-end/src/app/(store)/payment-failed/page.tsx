'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ServerActionStatus } from '@/lib/config/app.config';
import { getTransactionDetails } from '@/lib/server.actions';

const PaymentFailedPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const [transactionDetails, setTransactionDetails] = useState({
        id: '',
        amount: 0,
        method: 'Online',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        const verifyPayment = async () => {
        try {
        // Get transaction details from local storage
        const transactionId = searchParams.get('t');
        const sessionId = searchParams.get('s');
        
        if (!transactionId || !sessionId) {
            throw new Error('Missing required payment parameters');
        }
        const response = await getTransactionDetails(transactionId);
               
                if (response.status === ServerActionStatus.SUCCESS) {
                    // Set transaction details
                    setTransactionDetails(prev => ({
                        ...prev,
                        id: transactionId,
                        amount: response.data.amount
                    })); 
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment. Please contact support.');
                 
            }
        };
        verifyPayment();
    }, [router, searchParams]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace(ROUTES.MY_ACCOUNT);
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return <div>Redirecting to login...</div>;
    }

    return (
        <div className="auth-form-container md:!py-[84px]">
            <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
                <div className="space-y-3.5 text-center w-full">
                    <Image
                        src='/images/payment-failed.svg'
                        alt="payment failed"
                        width={200}
                        height={200}
                        className="mx-auto aspect-square max-sm:max-w-32"
                    />
                    <h1 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold">
                        Oops! Your Payment Didn&apos;t Go Through
                    </h1>
                    <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
                        Looks like your payment didn&apos;t make it through. Don&apos;t worry—take a moment, recharge, and try again to get your vape gear sorted.
                    </p>
                </div>

                <div className='py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5'>
                    <div className='flex items-start justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p className='text-nowrap'>Transaction ID</p>
                        <p className='break-all text-right'>{transactionDetails.id}</p>
                    </div>
                    <div className='flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Amount</p>
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
                    size="lg"
                    radius="md"
                    color="primary"
                    className="btn primary-btn shadow-input text-content-1 !font-medium h-11 mx-auto"
                    onPress={() => router.push(ROUTES.CHECKOUT)}
                >
                    Go to Checkout
                </Button>
            </div>
        </div>
    );
};

export default PaymentFailedPage; 