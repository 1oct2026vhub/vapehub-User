import { Button } from '@nextui-org/react';
import { MinusIcon, PlusIcon, TrashIcon, EditIcon, DangerIcon } from '@/components/Icons';
import { useCart } from '@/lib/context/CartContext';
import { useState } from 'react';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import NoImage from './NoImage';
import { CartItem } from '@/lib/config/cart.config';
import Link from 'next/link';

type CartCardProps = {
  item: CartItem;
  showAddMoreItem?: boolean;
};

const ShoppingCartCardDrawer: React.FC<CartCardProps> = ({ item, showAddMoreItem = false }) => {
  const { updateItemQuantity, removeItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0 || newQuantity > item.stock) return;
    setQuantity(newQuantity);
    await updateItemQuantity(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeItem(item.id);
  };
  return (
    <div className="bg-skin-white p-4 rounded-14 shadow-card space-y-2 md:space-y-4.5">
      <div className="flex items-start gap-3 md:gap-6">
        {/* Product Image */}
        <div className="bg-skin-white p-1.5 rounded-10 shadow-brand-card min-w-[84px]">
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <NoImage
              src={item.ProductImages}
              alt={item.name}
              width={65}
              height={63}
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2.5 md:gap-5">
          <div className="flex items-start gap-4 justify-between">
            <h4 className="text-content-2 md:text-title-2 font-semibold text-skin-neutral-400 md:mr-5">
              {item.name}
            </h4>

            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-title-1 font-bold">
              {DEFAULT_CURRENCY_SYMBOL}{(Number(item.price) * quantity).toFixed(2)}
              </p>
              {item.discount_price && (
                <p className="text-skin-neutral-300 text-content-3 md:text-title-2 line-through opacity-60 font-bold">
                  {DEFAULT_CURRENCY_SYMBOL}{(Number(item.discount_price) * quantity).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center border bg-skin-white w-fit shadow-base text-content-2 md:text-title-1 border-skin-primary-500 !leading-none px-2 rounded md:rounded-10 !font-bold h-5 md:h-10">
            <Button
              isIconOnly
              size="lg"
              variant="light"
              color="primary"
              className="text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent"
              onPress={() => handleQuantityChange(quantity - 1)}
              disabled={isLoading || quantity <= 1}
            >
              <MinusIcon className='w-3 md:w-6'/>
            </Button>
            <input 
              type="tel" 
              value={quantity}
              readOnly
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) handleQuantityChange(val);
              }}
              className='w-9 max-w-9 max-sm:h-3 text-center !border-none !outline-none placeholder:text-skin-neutral-500' 
            />
            <Button
              isIconOnly
              size="lg"
              variant="light"
              color="primary"
              className="text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent"
              onPress={() => handleQuantityChange(quantity + 1)}
              disabled={isLoading || quantity >= item.stock}
            >
              <PlusIcon className='w-3 md:w-6'/>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-5">
            <Button 
              size="sm" 
              isIconOnly 
              variant="light" 
              className="!p-0 hover:!bg-transparent !min-w-fit !w-fit"
              onPress={handleRemove}
              disabled={isLoading}
            >
              <TrashIcon className='w-4 h-4.5 md:w-5.5 md:h-6' />
            </Button>
            <Button 
              as={Link}
              href={`/${item.product_slug}/${item.slug}`}
              size="sm" 
              isIconOnly 
              variant="light" 
              className="!p-0 hover:!bg-transparent !min-w-fit !w-fit"
            >
              <EditIcon className='w-4 h-4.5 md:w-5.5 md:h-6' />
            </Button>
          </div>
        </div>
      </div>

      {/* Add More Item (Conditionally Rendered) */}
      {showAddMoreItem && (
        <div className="bg-[#FB6767]/30 border border-skin-white shadow-sm p-1.5 md:p-3 flex items-center gap-4 justify-between rounded-10">
          <div className="flex gap-2 items-center">
            <DangerIcon />
            <p className="text-content-3 md:text-content-1 font-semibold text-skin-neutral-500">
              Add 2 or more items to activate the 3 for £25 multibuy.
            </p>
          </div>
          <Button
            size="md"
            radius="md"
            color="default"
            variant="bordered"
            className="!py-2 !px-4 bg-skin-neutral-500 border-skin-white shadow-button text-skin-white !rounded-10 !text-content-2 md:!text-content-1 font-semibold !max-h-9 min-w-fit"
          >
            Add Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShoppingCartCardDrawer;
