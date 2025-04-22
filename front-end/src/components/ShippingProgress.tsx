'use client'
import { CartItem } from '@/lib/config/cart.config';
import { useCart } from '@/lib/context/CartContext';
import { Progress } from '@nextui-org/react'
import React from 'react'

const FREE_SHIPPING_THRESHOLD = 30;

const ShippingProgress: React.FC = () => {
    const { cartItems } = useCart();
    const totalPrice = cartItems.reduce((acc: number, item: CartItem) => acc + parseFloat(item.price) * item.quantity, 0);
    const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remainingAmount = FREE_SHIPPING_THRESHOLD - totalPrice;

    const getProgressLabel = () => {
        if (totalPrice >= FREE_SHIPPING_THRESHOLD) {
            return "You've qualified for free shipping!";
        }
        return `You're £${remainingAmount.toFixed(2)} away from free shipping!`;
    };

    return (
        <Progress
            classNames={{
                base: "w-full relative -mt-2",
                track: "bg-skin-primary-50 rounded-lg md:rounded-xl !h-7 md:!h-[46px]",
                indicator: "bg-skin-primary-200",
                label: "!text-content-3 md:!text-title-2 font-semibold text-skin-neutral-500 absolute z-10 left-[50%] top-4 md:top-5 translate-x-[-50%] w-fit whitespace-nowrap",
            }}
            label={getProgressLabel()}
            radius="sm"
            size="lg"
            value={progress}
        />
    )
}

export default ShippingProgress
