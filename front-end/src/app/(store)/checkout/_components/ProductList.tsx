import { useState } from 'react';
import { DownArrowIcon } from '@/components/Icons';
import ShoppingCartCard from '@/components/ShoppingCartCard';
import { useCart } from '@/lib/context/CartContext';

const ProductList: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { cartItems } = useCart();

    return (
        <div 
            className='bg-skin-white px-3.5 py-2 md:p-5 rounded-10 md:rounded-14 border border-skin-neutral-100 flex flex-col gap-6'
            
        >
            <div className='flex items-center justify-between cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className='primary-gradient-600 text-title-2 md:text-h5 font-bold'>Product List</h2>
                <DownArrowIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Products Section (conditionally rendered) */}
            {isExpanded && (
                <div className='space-y-4 md:space-y-6'>
                    {cartItems.map((item) => (
                        <ShoppingCartCard key={item.product_id} item={item} showAddMoreItem={false} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
