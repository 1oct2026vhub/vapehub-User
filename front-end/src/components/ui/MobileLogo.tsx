'use client';

import { FunctionComponent, ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileLogoProps {
    width?: number;
    height?: number;
    className?: string;
}

const MobileLogo: FunctionComponent<MobileLogoProps> = ({
    width = 174,
    height = 28,
    className,
}): ReactElement => {
    const pathname = usePathname();
    const isVerificationPage = pathname.includes('/verify-email');
    
    return (
        <Link href={!isVerificationPage ? '/' : '/verify-email'} className='w-fit flex justify-start'>
            <Image
                src='/images/vapehub-mob-logo.svg'
                alt='VapeHub'
                width={width}
                height={height}
                className={`${className} w-auto`}
            />
        </Link>
    );
};

export default MobileLogo;
