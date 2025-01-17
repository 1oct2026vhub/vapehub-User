'use client';

import { FunctionComponent, ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
}

const Logo: FunctionComponent<LogoProps> = ({
    width = 305,
    height = 50,
    className,
}): ReactElement => {
    return (
        <Link href='/home' className='w-fit flex'>
            <Image
                src='/images/logo.png'
                alt='Floe'
                width={width}
                height={height}
                className={`${className} max-h-12.5`}
            />
        </Link>
    );
};

export default Logo;
