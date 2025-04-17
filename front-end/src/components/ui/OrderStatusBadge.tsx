import { ORDER_STATUS } from "@/lib/config/order.config";
import { cn } from "@/lib/utils";

const OrderStatusBadge = ({status}: {status: ORDER_STATUS}) => {
    const statusColor = cn(
        "p-1.5 md:p-2 w-fit capitalize rounded-md md:rounded-lg border !text-content-3 md:!text-content-1 font-bold",
        {
            "bg-skin-neutral-50 border-skin-neutral-100 text-skin-neutral-500":status === ORDER_STATUS.PENDING,
            "bg-skin-white border-skin-neutral-100 text-skin-neutral-500":status === ORDER_STATUS.DRAFT,
            "bg-skin-white border-skin-blue-500 text-skin-blue-500": status === ORDER_STATUS.PROCESSING,
            "bg-skin-white border-skin-primary-500 text-skin-primary-500": status === ORDER_STATUS.SHIPPED, 
            "bg-skin-primary-50 border-skin-primary-500 text-skin-primary-500": status === ORDER_STATUS.COMPLETED,
            "bg-skin-primary-50 border-skin-primary2-500 text-skin-primary2-500": status === ORDER_STATUS.DELIVERED,
            "bg-skin-white border-skin-red-400 text-skin-red-400": status === ORDER_STATUS.FAIL,
            "bg-skin-red-400 border-skin-red-400 text-skin-white": status === ORDER_STATUS.CANCEL,
            "bg-skin-base border-skin-neutral-100 text-skin-neutral-500": status === ORDER_STATUS.RETURN_REQUESTED,
            "bg-skin-white border-skin-primary-400 text-skin-primary-400": status === ORDER_STATUS.RETURN_APPROVED,
            "bg-skin-white border-skin-primary2-400 text-skin-primary2-400": status === ORDER_STATUS.RETURN_RECEIVED,
            "bg-skin-base border-skin-neutral-100 text-skin-black": status === ORDER_STATUS.REFUNDED,
        }
    );

    return (
        <div className={statusColor}>{status}</div>
    )
}

export default OrderStatusBadge
