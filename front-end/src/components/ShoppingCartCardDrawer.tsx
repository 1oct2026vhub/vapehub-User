import { Button } from '@nextui-org/react';
import { TrashIcon, DangerIcon } from '@/components/Icons';
import { useCart } from '@/lib/context/CartContext';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import NoImage from './NoImage';
import { CartItem } from '@/lib/config/cart.config';
import Link from 'next/link';
import QuantitySelector from './QuantitySelector';

type CartCardProps = {
  item: CartItem;
};

const ShoppingCartCardDrawer: React.FC<CartCardProps> = ({ item }) => {
  const { removeItem, isLoading, stockValidationErrors, updateItemQuantity } = useCart();
  const error = stockValidationErrors.find(error => error.itemId === item.id);
  const handleRemove = async () => {
    await removeItem(item.id);
  };

  const handleAddNow = async () => {
    if (item.deal_qty_needed && item.deal_qty_needed > 0) {
      const newQuantity = item.quantity + item.deal_qty_needed;
      await updateItemQuantity(item.id, newQuantity, item.name);
    }
  };

  const queryParams = new URLSearchParams();
  item.variantAttributes.slice(1).forEach(attr => {
    queryParams.set(attr.attribute_id.toString(), attr.term_slug);
  });
  const productUrl = `/${item.product_slug}/${item.variantAttributes[0]?.term_slug ?? ''}?${queryParams.toString()}`;

  console.log("cart item", item);
  return (
    <div className="bg-skin-white p-4 rounded-14 shadow-card space-y-2 md:space-y-4.5 w-full">
      <div className="flex items-start gap-3 md:gap-6 w-full">
        {/* Product Image */}
        <Link href={productUrl} className="bg-skin-white p-1.5 rounded-10 shadow-brand-card min-w-[84px]">
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <NoImage
              src={item.ProductImages}
              alt={item.name}
              width={65}
              height={63}
            />
          </div>
        </Link>

        <div className="flex flex-col items-start gap-2.5 md:gap-5 w-full">
          <div className="flex items-start gap-4 justify-between w-full">
            <Link href={productUrl} className="text-content-2 md:text-title-2 font-semibold text-skin-neutral-400 md:mr-5">
              {item.name}
            </Link>

            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-title-1 font-bold">
                {DEFAULT_CURRENCY_SYMBOL}{item.total.toFixed(2)}
              </p>
              {item.discount_price && parseFloat(item.discount_price) > 0 && item.total !== item.subtotal && (
                <p className="text-skin-neutral-300 text-content-3 md:text-title-2 line-through opacity-60 font-bold">
                  {DEFAULT_CURRENCY_SYMBOL}{(item.subtotal).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 justify-between w-full">
            <div>
              {/* Quantity Selector */}
              <QuantitySelector item={item} />
              {error && (
                <p className='text-red-500 text-content-3 md:text-content-1 font-bold'>{error.message}</p>
              )}
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
              {/* <Button 
              as={Link}
              href={`/${item.product_slug}`}
              size="sm" 
              isIconOnly 
              variant="light" 
              className="!p-0 hover:!bg-transparent !min-w-fit !w-fit"
            >
              <EditIcon className='w-4 h-4.5 md:w-5.5 md:h-6' />
            </Button> */}
            </div>
          </div>

        </div>
      </div>

      {/* Add More Item (Conditionally Rendered) */}
      {
        item.show_deal_toast && item.deal_qty_needed && item.deal_qty_needed > 0 && (
          <div className="bg-[#FB6767]/30 border border-skin-white shadow-sm p-1.5 md:p-3 flex items-center gap-4 justify-between rounded-10">
            <div className="flex gap-2 items-center">
              <DangerIcon />
              <p className="text-content-3 md:text-content-1 font-semibold text-skin-neutral-500">
                Add {item.deal_qty_needed} more items to activate the {item.deals?.[0]?.name} multibuy.
              </p>
            </div>
            <Button
              size="md"
              radius="md"
              color="default"
              variant="bordered"
              className="!py-2 !px-4 bg-skin-neutral-500 border-skin-white shadow-button text-skin-white !rounded-10 !text-content-2 md:!text-content-1 font-semibold !max-h-9 min-w-fit"
              onPress={handleAddNow}
              disabled={isLoading}
            >
              Add Now
            </Button>
          </div>
        )
      }
    </div >
  );
};

export default ShoppingCartCardDrawer;
