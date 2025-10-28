import GoBackButton from '@/components/common/GoBackButton';
import Image from 'next/image'; 
import React, { Suspense } from 'react';
// generate metadata
export async function generateMetadata() {
    return {
        title: "404 Not Found | VapeHub",
        description: "The page you are looking for does not exist.",
        openGraph: {
            title: "404 Not Found | VapeHub",
            description: "The page you are looking for does not exist.",
            images: "/images/404-not-found.jpg",
        },
    };
}

const NotFoundContent: React.FC = () => {
    return (
        <div className="auth-form-container md:!py-[84px]">
            <div className="auth-form-wrapper !items-center !space-y-0 !rounded-3xl !max-w-[772px] !gap-8">
                <div className='space-y-2 text-center'>
                    <h1 className='text-h5 md:text-h2 font-semibold primary-gradient-600'>Uh-oh! This Page Went Up in Smoke!</h1>
                    <p className='text-content-1 font-bold text-skin-neutral-300'>Looks like this page took a puff and disappeared! But don&apos;t worry, you&apos;re not lost forever.</p>
                </div>
                <Image
                    src='/images/404-not-found.jpg'
                    alt="404 not found"
                    width={410}
                    height={354}
                    className="mx-auto"
                />
                <GoBackButton />
            </div>
        </div>
    );
};

const NotFoundPage: React.FC = () => {
    return (
        <Suspense>
            <NotFoundContent />
        </Suspense>
    );
};

export default NotFoundPage;