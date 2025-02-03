import { Button } from '@nextui-org/button'
import React from 'react'
import { LeftArrowIcon, MoreHorizontalIcon, RightArrowIcon } from './Icons'

const Pagination: React.FC = () => {
    return (
        <div className="flex items-center gap-2">
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                isIconOnly
                className="min-w-fit bg-skin-neutral-50 !w-9 !h-9 rounded-10 !p-2"
                isDisabled
                startContent={<LeftArrowIcon stroke="#6B7270" className="" />}
            />

            <Button
                color="secondary"
                size="sm"
                radius="sm"
                className="min-w-fit bg-primary-gradient-100 rounded-10 !w-9 !h-9 !p-2"
            >
                <span className="!text-skin-white !text-title-2 font-semibold">1</span>
            </Button>
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                className="min-w-fit bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9 !p-2"
            >
                <span className="!text-title-2 !text-skin-neutral-500">2</span>
            </Button>
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                className="min-w-fit bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9 !p-2"
            >
                <MoreHorizontalIcon />
            </Button>
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                className="min-w-fit bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9 !p-2"
            >
                <span className="!text-title-2 !text-skin-neutral-500">99</span>
            </Button>
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                className="min-w-fit !p-2 bg-skin-neutral-50 rounded-10 font-semibold !w-9 !h-9"
            >
                <span className="!text-title-2 !text-skin-neutral-500">100</span>
            </Button>
            <Button
                color="secondary"
                size="sm"
                radius="sm"
                isIconOnly
                className="bg-skin-neutral-50 rounded-10 !text-skin-neutral-500 !w-9 !h-9"
                startContent={<RightArrowIcon stroke="#3A4340" className="w-4.5 h-4.5" />}
            />
        </div>
    )
}

export default Pagination
