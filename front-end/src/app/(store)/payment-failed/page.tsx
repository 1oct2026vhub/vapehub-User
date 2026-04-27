'use client'

import { Suspense } from 'react';
import PaymentFailedContent from './PaymentFailedContent';

export const dynamic = 'force-dynamic';

const PaymentFailedPage = () => {
    return (
        <Suspense fallback={
            <div className="auth-form-container md:!py-[84px]">
                <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
                    <div className="text-center">
                        <p className="text-content-1 font-semibold">Checking payment status...</p>
                    </div>
                </div>
            </div>
        }>
            <PaymentFailedContent />
        </Suspense>
    );
};

export default PaymentFailedPage;
