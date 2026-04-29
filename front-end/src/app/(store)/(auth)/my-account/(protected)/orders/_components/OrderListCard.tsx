import NoImage from "@/components/NoImage";
import { ORDER_RESPONSE, ORDER_STATUS } from "@/lib/config/order.config";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";

type OrderListCardProps = {
    data: ORDER_RESPONSE;
}
 
const OrderListCard: React.FC<OrderListCardProps> = ({data}) => {
    const isPaymentPending = data.status === ORDER_STATUS.PENDING;
    const productImage = data.orderItems?.[0]?.variant?.variantImages?.[0]?.image_url || data.orderItems?.[0]?.product?.ProductImages?.[0]?.image_url || "";
    
    return (
        <Link href={`${ROUTES.ORDER_DETAILS}/${data.id}`} className="bg-white rounded-md shadow-card hover:shadow-brand-card p-2 md:p-4 flex items-start gap-3 md:gap-7">
            {/* Product Image Section */}
            <div className="bg-skin-white p-1 md:p-2 rounded-md md:rounded-10 shadow-brand-card min-w-fit w-full max-w-fit">
                <div className="bg-skin-base border border-skin-neutral-100 rounded p-1.5 md:px-2.5 md:py-3.5 shadow h-full w-fit flex flex-col justify-center">
                    <NoImage 
                        src={productImage}
                        alt={data.orderItems?.[0]?.product?.name || ""}
                        width={104}
                        height={100}
                        className="aspect-square w-full min-w-[104px] max-w-[104px]"
                    />
                </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3.5 md:space-y-2">
                {/* Status Badge */}
                <OrderStatusBadge status={data.status as ORDER_STATUS} />  

                {/* Payment Pending Message */}
                {isPaymentPending && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                        <p className="text-yellow-700 text-sm font-medium">
                            ⚠️ Payment Required: Please complete your payment to confirm this order
                        </p>
                    </div>
                )}

                {/* Order Title */}
                <h3 className="text-content-2 md:text-xl text-skin-neutral-400 line-clamp-2 font-semibold">
                    {data.orderItems?.[0]?.product?.name}
                </h3>
                {data.orderItems.length > 1 && <p className="primary-gradient-100 font-semibold text-sm ml-1 ">(+ {data.orderItems.length - 1} more)</p>}

                {/* Order ID */}
                <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Order ID: {data.order_unique_id}</p>
            </div>
        </Link>
    );
};

export default OrderListCard;
