'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { ServerActionStatus } from '@/lib/config/app.config';
import { getTransactionDetails } from '@/lib/server.actions';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PaymentSuccessPage = () => {
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
                // Get parameters from URL
                const transactionId = searchParams.get('t');
                const sessionId = searchParams.get('s');
                
                if (!transactionId || !sessionId) {
                    throw new Error('Missing required payment parameters');
                }

                // Update order status with transaction details
                const response = await getTransactionDetails(transactionId);
                
                if (response.status === ServerActionStatus.SUCCESS) {
                    // Set transaction details
                    setTransactionDetails(prev => ({
                        ...prev,
                        id: transactionId,
                        method: response.data.payment_method,
                        amount: response.data.amount
                    })); 
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Failed to verify payment. Please contact support.');
                // router.push(ROUTES.PAYMENT_FAILED);
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
                        src='/images/payment-success.svg'
                        alt="payment success"
                        width={200}
                        height={200}
                        className="mx-auto"
                    />
                    <h1 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold">Puff, Paid, Perfect!</h1>
                    <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
                        Payment completed. Your next puff is on its way.
                    </p>
                </div>

                <div className='py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5'>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Transaction ID</p>
                        <p>{transactionDetails.id}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Amount Paid</p>
                        <p>£{transactionDetails.amount}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Payment Method</p>
                        <p>{transactionDetails.method}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Date</p>
                        <p>{transactionDetails.date}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
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