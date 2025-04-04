import { Button } from '@nextui-org/react';
import { MinusIcon, PlusIcon, TrashIcon, EditIcon, DangerIcon } from '@/components/Icons';
import { useCart } from '@/lib/context/CartContext';
import { CART_RESPONSE_DATA } from '@/lib/config/cart.config';
import { useState } from 'react';
import NoImage from './NoImage';

type CartCardProps = {
  item?: CART_RESPONSE_DATA;
  showAddMoreItem?: boolean;
};

const ShoppingCartCard: React.FC<CartCardProps> = ({ item, showAddMoreItem = false }) => {
  const { updateItemQuantity, removeItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(item?.quantity ?? 0);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0 || newQuantity > (item?.product.stock_quantity ?? 0)) return;
    setQuantity(newQuantity);
    await updateItemQuantity(item?.product_id ?? 0, newQuantity);
  };

  const handleRemove = async () => {
    await removeItem(item?.product_id ?? 0);
  };

  return (
    <div className="bg-skin-white p-4 rounded-14 shadow-card space-y-2 md:space-y-4.5">
      <div className="flex items-start gap-3 md:gap-6">
        {/* Product Image */}
        <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <NoImage
              src={item?.product.ProductImages?.[0]?.image_url}
              alt={item?.product.name}
              width={104}
              height={100}
            />
          
          </div>
        </div>

        <div className="flex flex-col gap-2.5 md:gap-5">
          <div className="flex items-start gap-4 md:gap-8 justify-between">
            <h4 className="text-content-2 md:text-title-2 xl:text-title-1 font-semibold text-skin-neutral-400 mr-5">
              {item?.product.name}
            </h4>

            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-title-1 xl:text-h5 font-bold">
                £{(Number(item?.product.price) * quantity).toFixed(2)}
              </p>
              {item?.product.discount_price && (
                <p className="text-skin-neutral-300 text-content-3 md:text-title-2 xl:text-title-1 line-through opacity-60 font-bold">
                  £{(Number(item?.product.discount_price) * quantity).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 justify-between">
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
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleQuantityChange(val);
                }}
                className='w-9 max-w-9 text-center !border-none !outline-none !bg-transparent max-sm:h-3 placeholder:text-skin-neutral-500' 
              />
              <Button
                isIconOnly
                size="lg"
                variant="light"
                color="primary"
                className="text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent"
                onPress={() => handleQuantityChange(quantity + 1)}
                disabled={isLoading || quantity >= (item?.product.stock_quantity ?? 0)}
              >
                <PlusIcon className='w-3 md:w-6'/>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-6">
              <Button 
                size="sm" 
                isIconOnly 
                variant="light" 
                className="hover:!bg-transparent"
                onPress={handleRemove}
                disabled={isLoading}
              >
                <TrashIcon className='w-5 md:w-9 h-5 md:h-9' />
              </Button>
              <Button size="sm" isIconOnly variant="light" className="hover:!bg-transparent">
                <EditIcon className='w-5 md:w-9 h-5 md:h-9' />
              </Button>
            </div>
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

export default ShoppingCartCard;
