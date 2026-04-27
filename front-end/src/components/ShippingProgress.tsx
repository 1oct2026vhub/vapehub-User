'use client'
import { CartItem } from '@/lib/config/cart.config';
import { useCart } from '@/lib/context/CartContext';
import { Progress } from '@nextui-org/react'
import React from 'react'
import { FREE_DELIVERY_THRESHOLD, orderMeetsFreeShippingThreshold } from '@/lib/utils';
 

interface ShippingProgressProps {
    totalAmount?: number;
    freeShippingThreshold?: number;
    shippingCost?: number;
}

const ShippingProgress: React.FC<ShippingProgressProps> = ({ totalAmount, freeShippingThreshold, shippingCost = 0 }) => {
    const { cartItems, cartTotal } = useCart();
    const calculatedTotalPrice = cartItems.reduce((acc: number, item: CartItem) => acc + parseFloat(item.price) * item.quantity, 0);

    // Prefer the explicit prop, then cartTotal (which already reflects deals/discounts), then fallback to raw cart item total
    const totalPrice = totalAmount ?? (Number.isFinite(cartTotal) ? cartTotal : calculatedTotalPrice);
    const threshold = freeShippingThreshold ?? FREE_DELIVERY_THRESHOLD;
    
    // Calculate remaining amount based on: threshold - (total amount - shipping cost)
    // This gives the amount needed to reach free shipping threshold (pence-safe vs float totals)
    const amountForFreeShipping = totalPrice - shippingCost;
    const thresholdPence = Math.round(threshold * 100);
    const amountPence = Math.round(amountForFreeShipping * 100);
    const remainingAmount = thresholdPence > 0 ? Math.max(0, thresholdPence - amountPence) / 100 : 0;
    const progress = thresholdPence > 0 ? Math.min((amountPence / thresholdPence) * 100, 100) : 0;

    const getProgressLabel = () => {
        if (orderMeetsFreeShippingThreshold(amountForFreeShipping, threshold)) {
            return "You've qualified for free shipping!";
        }
        return `You're £${remainingAmount.toFixed(2)} away from free shipping!`;
    };

    return (
        <Progress
            classNames={{
                base: "w-full relative -mt-2",
                track: "bg-skin-primary-50 rounded md:rounded-md !h-7 md:!h-[46px]",
                indicator: "bg-skin-primary-200",
                label: "!text-content-3 md:!text-title-2 font-semibold !font-oswald text-skin-neutral-500 absolute z-10 left-[50%] top-4 md:top-5 translate-x-[-50%] w-fit whitespace-nowrap",
            }}
            label={getProgressLabel()}
            radius="sm"
            size="lg"
            value={progress}
        />
    )
}

export default ShippingProgress
