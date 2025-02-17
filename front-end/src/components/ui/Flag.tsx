import Image from 'next/image'
import React from 'react'

const Flag: React.FC = () => {
    return (
        <Image
            src='/images/flag.svg'
            alt='Flag'
            width={24}
            height={24}
        />
    )
}

export default Flag
