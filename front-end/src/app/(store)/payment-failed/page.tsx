'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
const PaymentFailedPage = () => {
    const router = useRouter();
    const { status } = useSession();
    const [transactionDetails, setTransactionDetails] = useState({
        id: '',
        amount: '',
        method: 'Online',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        // Get transaction details from local storage
        const orderRef = localStorage.getItem('vivaOrderRef');
        const amount = localStorage.getItem('vivaOrderAmount');
        
        if (orderRef && amount) {
            setTransactionDetails(prev => ({
                ...prev,
                id: orderRef,
                amount: amount
            }));
        }

        // Clear the order reference from local storage
        localStorage.removeItem('vivaOrderRef');
        localStorage.removeItem('vivaOrderAmount');
        toast.error('Payment failed. Please try again.');
    }, []);

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
                        className="mx-auto"
                    />
                    <h1 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold">
                        Oops! Your Payment Didn&apos;t Go Through
                    </h1>
                    <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
                        Looks like your payment didn&apos;t make it through. Don&apos;t worry—take a moment, recharge, and try again to get your vape gear sorted.
                    </p>
                </div>

                <div className='py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5'>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Transaction ID</p>
                        <p>{transactionDetails.id}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Amount</p>
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