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
    width = 295,
    height = 50,
    className,
}): ReactElement => {
    return (
        <Link href='/' className='w-fit flex justify-start'>
            <Image
                src='/images/vapehub-logo.svg'
                alt='VapeHub'
                width={width}
                height={height}
                className={`${className} max-h-12.5 w-auto`}
            />
        </Link>
    );
};

export default Logo;
