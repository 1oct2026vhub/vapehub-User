import { Progress } from '@nextui-org/react'
import React from 'react'

const ShippingProgress: React.FC = () => {
    return (
        <Progress
            classNames={{
                base: "w-full relative -mt-2",
                track: "bg-skin-primary-50 rounded-lg md:rounded-xl !h-7 md:!h-[46px]",
                indicator: "bg-skin-primary-200",
                label: "!text-content-3 md:!text-title-2 font-semibold text-skin-neutral-500 absolute z-10 left-[50%] top-4 md:top-5 translate-x-[-50%] w-fit whitespace-nowrap",
            }}
            label="You’re £19.05 away from free shipping!"
            radius="sm"
            size="lg"
            value={72}
        />
    )
}

export default ShippingProgress
