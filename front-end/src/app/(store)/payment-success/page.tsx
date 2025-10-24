'use client'

import { Suspense } from 'react';
import PaymentSuccessContent from './PaymentSuccessContent';

export const dynamic = 'force-dynamic';

const PaymentSuccessPage = () => {
    return (
        <Suspense fallback={
            <div className="auth-form-container md:!py-[84px]">
                <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
                    <div className="text-center">
                        <p className="text-content-1 font-semibold">Verifying payment...</p>
                    </div>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
};

export default PaymentSuccessPage;
