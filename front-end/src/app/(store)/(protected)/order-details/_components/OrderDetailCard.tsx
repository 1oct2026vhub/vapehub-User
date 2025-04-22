import { ORDER, ORDER_STATUS } from "@/lib/config/order.config";
import NoImage from "@/components/NoImage";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/config/app.config";
import Link from "next/link";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";

interface OrderDetailCardProps {
    status:string;
    data: ORDER['orderItems'][0];
    isCouponApplied: number | null;
}

const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
    status,
    isCouponApplied,
    data
}) => {
    const attributes = data.variant?.variantAttributes;
    const attributeParams = data.variant?.variantAttributes?.[0]?.term.slug ?? '';
    
    return (
        // 10ml?20=up-to-1500-puffs
        <Link href={`/${data.product.slug}/${attributeParams}`} scroll={true} className="bg-white rounded-14 shadow-card p-2 md:p-4 flex items-stretch gap-3 md:gap-7">

            <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
                <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow h-full flex flex-col justify-center">

                    <NoImage
                        src={data.variant?.variantImages?.[0]?.image_url || data.product.ProductImages?.[0]?.image_url || ""}
                        alt={data.product.name}
                        width={104}
                        height={100}
                    />
                </div>
            </div>

            <div className="flex items-start gap-6 justify-between w-full">
                <div className="flex flex-col gap-4">
                    {/* Status Badge */}
                    <OrderStatusBadge status={status as ORDER_STATUS} />

                    {/* Order Title */}
                    <h2 className="text-content-2 sm:text-content-1 lg:text-title-1 text-skin-neutral-400 font-semibold">
                        {data.product.name}
                    </h2>

                    {/* Order ID */}
                    <div>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Quantity : {data.quantity}</p>
                        {/* <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Flavour : {data.variant?.slug}</p> */}
                        {
                            attributes?.map((attr) => (
                                <p key={attr.id} className="primary-gradient-100 text-content-3 md:text-content-1 font-bold capitalize">{attr.attribute.name} : {attr.term.name}</p>
                            ))
                        }
                    </div>
                </div>
                <div className="space-y-2 text-right">
                    <p className="text-skin-neutral-500 text-content-1 sm:text-title-2 lg:text-h5 font-bold">{DEFAULT_CURRENCY_SYMBOL}{(data.quantity * parseFloat(data.variant?.price || '0')).toFixed(2)}</p>
                    {isCouponApplied && <p className="primary-gradient-100 text-content-3 sm:text-content-1 lg:text-title-1 font-bold text-nowrap">Coupon Applied</p>}
                </div>
            </div>
        </Link>
    );
};

export default OrderDetailCard;
