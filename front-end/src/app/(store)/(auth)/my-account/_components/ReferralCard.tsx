import { Button } from '@nextui-org/button'
import React from 'react'

const ReferralCard: React.FC = () => {
    return (
        <div className="bg-skin-white p-4 flex items-start justify-between gap-5 shadow-card rounded-14">
            <div className="space-y-1">
                <h3 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold capitalize">
                    Neerajdev R
                </h3>
                <p className="text-content-1 font-bold primary-gradient-100">neerajmundoli@gmail.com</p>
            </div>
            <div className="space-y-2.5 text-right">
                <h4 className="text-title-2 md:text-title-1 text-skin-neutral-400 font-semibold">
                    04HSGF566
                </h4>
                <Button size="sm" color='primary' className="bg-skin-neutral-500 rounded-10">
                    Copy Code
                </Button>
            </div>
        </div>
    )
}

export default ReferralCard
