"use client"
import { useState } from 'react';
import { DownArrowIcon } from '@/components/Icons';
import ShoppingCartCard from '@/components/ShoppingCartCard';
import { useCart } from '@/lib/context/CartContext';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';

interface ProductListProps {
    reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}

const ProductList: React.FC<ProductListProps> = ({ reviews }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { cartItems } = useCart(); 
    return (
        <div className='bg-skin-white px-3.5 py-2 md:p-5 rounded shadow-checkout border border-skin-neutral-100 flex flex-col gap-6'>
            <div className='flex items-center justify-between cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
                <div className='!font-oswald primary-gradient-600 text-title-2 md:text-2xl font-semibold'>Product List</div>
                <DownArrowIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Products Section (conditionally rendered) */}
            {isExpanded && (
                <div className='space-y-4 md:space-y-6'>
                    {cartItems.map((item, idx) => (
                        <ShoppingCartCard
                            key={idx}
                            item={item}
                            reviews={reviews}
                            refreshCartAfterRemove
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
