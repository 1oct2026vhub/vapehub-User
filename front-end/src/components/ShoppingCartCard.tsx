"use client"
import { Button, Link } from '@nextui-org/react';
import { TrashIcon, DangerIcon } from '@/components/Icons';
import { useCart } from '@/lib/context/CartContext';
import NoImage from './NoImage';
import { CartItem } from '@/lib/config/cart.config';
import { DEFAULT_CURRENCY_SYMBOL, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import QuantitySelector from './QuantitySelector'; 
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { RatingStarEmpty, RatingStarFilled } from './Icons';
import { buildCartProductUrl } from '@/lib/utils/cart-product-url';

type CartCardProps = {
  item?: CartItem;
  reviews?: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  refreshCartAfterRemove?: boolean;
};

const ShoppingCartCard: React.FC<CartCardProps> = ({
  item,
  reviews = [],
  refreshCartAfterRemove = false,
}) => {

  const { removeItem, isLoading, stockValidationErrors, updateItemQuantity } = useCart();
  const error = stockValidationErrors.find(error => error.itemId === item?.id);

  const handleRemove = async () => {
    if (!item?.id) return;
    await removeItem(item.id, { refreshFromApi: refreshCartAfterRemove });
  };

  const handleAddNow = async () => {
    if (item && item.deal_qty_needed && item.deal_qty_needed > 0) {
      const newQuantity = item.quantity + item.deal_qty_needed;
      await updateItemQuantity(item.id, newQuantity, item.name);
    }
  };

  if (!item) return null;

  const review = reviews.find(r => r.status === ServerActionStatus.SUCCESS && r.data?.reviews.find(review => review.product_id === item.product_id));
  const averageRating = review?.status === ServerActionStatus.SUCCESS ? parseFloat(review.data.average_rating) : 0;
  const totalReviews = review?.status === ServerActionStatus.SUCCESS ? review.data.total_reviews : 0;

  const productUrl = buildCartProductUrl(item);
  return (
    <div className="bg-skin-white p-4 rounded-lg shadow-card space-y-2 md:space-y-4.5 w-full">
      <div className="flex items-start gap-3 md:gap-6 w-full">
        {/* Product Image */}
        <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
          <Link href={productUrl}>
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <NoImage
              src={item.ProductImages}
              alt={item.name}
              width={104}
              height={100}
            />
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 md:gap-5 w-full">
          <div className="flex items-start gap-4 w-full justify-between shrink">
            <Link href={productUrl} className="cursor-pointer text-wrap text-content-2 md:text-xl font-semibold !font-oswald text-skin-neutral-400">
              {item.name}
            </Link>

            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-2xl font-semibold !font-oswald min-w-fit">
                {/* {DEFAULT_CURRENCY_SYMBOL}{(Number(item.price) * item.quantity).toFixed(2)} */}
                {DEFAULT_CURRENCY_SYMBOL}{item.total.toFixed(2)}
              </p>
              {item.discount_price && parseFloat(item.discount_price) > 0 && item.total !== item.subtotal && (
                <p className="text-skin-neutral-300 text-content-3 md:text-title-2 xl:text-title-1 line-through opacity-60 font-bold">
                  {DEFAULT_CURRENCY_SYMBOL}{item.subtotal.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-1'>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => {
                if (i < Math.round(averageRating)) {
                  return <RatingStarFilled key={i} className='w-3 md:w-4' />;
                }
                return <RatingStarEmpty key={i} className='w-3 md:w-4' />;
              })}
            </div>
            <p className="text-[8px] md:text-content-3 xl:text-content-2 text-black font-bold mt-0.5">({totalReviews} Reviews)</p>
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
              className="!py-1 !px-3 bg-skin-neutral-500 border-skin-white shadow-button text-skin-white uppercase !rounded-md !text-content-2 md:!text-content-1 font-semibold min-w-fit"
              onPress={handleAddNow}
              disabled={isLoading}
            >
              Add Now
            </Button>
          </div>
        )
      }
    </div>
  );
};

export default ShoppingCartCard;
