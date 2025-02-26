import Image from 'next/image';
import { Button } from '@nextui-org/react';
import { MinusIcon, PlusIcon, TrashIcon, EditIcon, DangerIcon } from '@/components/Icons';

type CartCardProps = {
  showAddMoreItem?: boolean;
};

const ShoppingCartCardDrawer: React.FC<CartCardProps> = ({ showAddMoreItem = false }) => {
  return (
    <div className="bg-skin-white p-4 rounded-14 shadow-card space-y-2 md:space-y-4.5">
      <div className="flex items-start gap-3 md:gap-6">
        {/* Product Image */}
        <div className="bg-skin-white p-1.5 rounded-10 shadow-brand-card min-w-[84px]">
          <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow">
            <Image src="/images/product-1.png" alt="Product" width={65} height={63} />
          </div>
        </div>

        <div className="flex items-start gap-2.5 md:gap-5">
          <div className="flex flex-col gap-2 justify-between">
            <h4 className="text-content-2 md:text-title-2 font-semibold text-skin-neutral-400 mr-5">
              RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles
            </h4>

            {/* Quantity Selector */}
            <div className="flex items-center border bg-skin-white w-fit shadow-base text-content-2 md:text-title-1 border-skin-primary-500 !leading-none px-2 rounded md:rounded-10 !font-bold h-5 md:h-10 mt-auto">
              <Button
                isIconOnly
                size="lg"
                variant="light"
                color="primary"
                className="text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent"
              >
                <MinusIcon className='w-3 md:w-6'/>
              </Button>
              <input type="tel" name="" id="" placeholder='1' className='w-9 max-w-9 max-sm:h-3 !border-none !outline-none placeholder:text-skin-neutral-500 ml-4' />
              <Button
                isIconOnly
                size="lg"
                variant="light"
                color="primary"
                className="text-title-1 font-medium !px-0 !w-fit md:!w-6 !min-w-fit !h-5 md:!h-10 first:rounded-l-10 last:rounded-r-10 hover:!bg-transparent"
              >
                <PlusIcon className='w-3 md:w-6'/>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-between">
            {/* Price Section */}
            <div className="text-right">
              <p className="primary-gradient-100 text-content-2 md:text-title-1 font-bold">£12.99</p>
              <p className="text-skin-neutral-300 text-content-3 md:text-title-2 line-through opacity-60 font-bold">£12.99</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" isIconOnly variant="light" className="hover:!bg-transparent">
                <TrashIcon className='w-4 h-4.5 md:w-5.5 md:h-6' />
              </Button>
              <Button size="sm" isIconOnly variant="light" className="hover:!bg-transparent">
                <EditIcon className='w-4 h-4.5 md:w-5.5 md:h-6' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add More Item (Conditionally Rendered) */}
      {showAddMoreItem && (
        <div className="bg-[#FB6767]/30 border border-skin-white shadow-sm p-1.5 md:p-3 flex gap-4 justify-between rounded-10">
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
