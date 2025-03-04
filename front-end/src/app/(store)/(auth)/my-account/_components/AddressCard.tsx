import { EditIcon2, TrashIcon2 } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import React from 'react'

const AddressCard: React.FC = () => {
    return (
        <div className='bg-skin-white p-3.5 flex items-start justify-between gap-2 border border-skin-neutral-200 rounded-10 shadow-base'>
            <div className='space-y-1.5'>
                <h3 className='text-content-1 md:text-title-2 font-bold text-skin-neutral-500 capitalize'>Neerajdev R</h3>
                <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>Queen Street 75-80, Portsmouth, PO1 3HS, Portsmouth</p>
                <p className='text-content-2 md:text-content-1 text-skin-neutral-300 font-bold'>L2 2AY</p>
            </div>
            <div className="flex items-center gap-2">
                <Button size="md" isIconOnly color='primary' className="rounded-10 bg-red-gradient-100">
                    <TrashIcon2 className='w-4.5 h-4.5 min-w-4.5' />
                </Button>
                <Button size="md" isIconOnly color='primary' className="bg-skin-neutral-500 rounded-10">
                    <EditIcon2 className='w-4.5 h-4.5 min-w-4.5' />
                </Button>
            </div>
        </div>
    )
}

export default AddressCard
