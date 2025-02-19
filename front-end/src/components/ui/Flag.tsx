import Image from 'next/image';
import React from 'react';

interface FlagProps {
    className?: string;
}

const Flag: React.FC<FlagProps> = ({ className }) => {
    return (
        <Image
            src="/images/flag.svg"
            alt="Flag"
            width={24}
            height={24}
            className={className}
        />
    );
};

export default Flag;
