"use client"
import { Button, Link } from '@nextui-org/react';
import { TrashIcon, DangerIcon } from '@/components/Icons';
import { useCart } from '@/lib/context/CartContext';
import NoImage from './NoImage';
import { CartItem } from '@/lib/config/cart.config';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import QuantitySelector from './QuantitySelector'; 

type CartCardProps = {
  item?: CartItem;
  showAddMoreItem?: boolean;
};

const ShoppingCartCard: React.FC<CartCardProps> = ({ item, showAddMoreItem = false }) => {

  const { removeItem, isLoading, stockValidationErrors } = useCart();
  const error = stockValidationErrors.find(error => error.itemId === item?.id);

  const handleRemove = async () => {
    if (!item?.id) return;
    await removeItem(item.id);
  };

  if (!item) return null;
  return (
    <div className="bg-skin-white p-4 rounded-14 shadow-card space-y-2 md:space-y-4.5 w-full">
      <div className="flex items-start gap-3 md:gap-6 w-full">
        {/* Product Image */}
        <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <NoImage
              src={item.ProductImages}
              alt={item.name}
              width={104}
              height={100}
            />

          </div>
        </div>

        <div className="flex flex-col gap-2.5 md:gap-5 w-full">
          <div className="flex items-start gap-4 md:gap-8 justify-between">
            <Link href={`/${item.product_slug}`} className="cursor-pointer text-content-2 md:text-title-2 xl:text-title-1 font-semibold text-skin-neutral-400 mr-5">
              {item.name}
            </Link>

            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-title-1 xl:text-h5 font-bold">
                {/* {DEFAULT_CURRENCY_SYMBOL}{(Number(item.price) * item.quantity).toFixed(2)} */}
                {DEFAULT_CURRENCY_SYMBOL}{item.total.toFixed(2)}
              </p>
              {item?.discount_price && (
                <p className="text-skin-neutral-300 text-content-3 md:text-title-2 xl:text-title-1 line-through opacity-60 font-bold">
                  {/* {DEFAULT_CURRENCY_SYMBOL}{(Number(item.discount_price) * item.quantity).toFixed(2)} */}
                  {DEFAULT_CURRENCY_SYMBOL}{item.subtotal.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 justify-between w-full">
            {/* Quantity Selector */}

            <QuantitySelector
              item={item}
            />
            
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
              {/* <Button 
                as={Link}
                href={`/${item?.product_slug}`}
                size="sm" 
                isIconOnly 
                variant="light" 
                className="hover:!bg-transparent">
                <EditIcon className='w-5 md:w-9 h-5 md:h-9' />
              </Button> */}
            </div>
          </div>
          {error && (
              <p className='text-red-500 text-content-3 md:text-content-1 font-bold'>{error.message}</p>
            )}
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
