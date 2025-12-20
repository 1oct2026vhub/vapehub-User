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
    
    const handleLogoClick = () => {
        // Clear saved scroll position for landing page to ensure it starts at top
        if (!isVerificationPage) {
            try {
                sessionStorage.removeItem('scrollPos_/');
                // Set flag to skip scroll restoration when navigating to landing page
                sessionStorage.setItem('skipScrollRestore_/', 'true');
            } catch {
                // Ignore storage errors
            }
            // Scroll to top immediately
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };
    
    return (
        <Link 
            href={!isVerificationPage ? '/' : '/verify-email'} 
            className='w-fit flex justify-start'
            onClick={handleLogoClick}
        >
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
