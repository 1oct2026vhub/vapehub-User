import { ROUTES } from '@/lib/routes';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="auth-form-container md:!py-[84px]">
            <div className="auth-form-wrapper !items-center !space-y-0 !rounded-3xl !max-w-[772px] !gap-8">
                <div className='space-y-2 text-center'>
                    <h1 className='text-h5 md:text-h4 font-bold primary-gradient-600'>Uh-oh! This Page Went Up in Smoke!</h1>
                    <p className='text-content-1 font-bold text-skin-neutral-300'>Looks like this page took a puff and disappeared! But don’t worry, you’re not lost forever.</p>
                </div>
                <Image
                    src='/images/404-not-found.jpg'
                    alt="404 not found"
                    width={410}
                    height={354}
                    className="mx-auto"
                />
                <Link href={ROUTES.WELCOME} className="btn primary-btn w-full text-center text-title-2 font-semibold">
                    Go Back
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;