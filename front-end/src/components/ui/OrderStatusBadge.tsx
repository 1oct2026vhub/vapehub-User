import { ORDER_STATUS } from "@/lib/config/order.config";
import { cn } from "@/lib/utils";

const OrderStatusBadge = ({status}: {status: ORDER_STATUS}) => {
    const statusColor = cn(
        "p-1.5 md:p-2 w-fit capitalize rounded-md md:rounded-lg border !text-content-3 md:!text-content-1 font-bold",
        {
            "bg-skin-white border-skin-neutral grey-gradient":status === ORDER_STATUS.PENDING,
            "bg-skin-white border-skin-blue-500 blue-gradient": status === ORDER_STATUS.PROCESSING,
            "bg-skin-white border-skin-blue-500 green-gradient": status === ORDER_STATUS.SHIPPED, 
            "bg-skin-white border-skin-blue-500 success-gradient": status === ORDER_STATUS.COMPLETED,
            "bg-skin-primary-50 border-skin-primary2-500 text-skin-primary2-500": status === ORDER_STATUS.DELIVERED,
            "bg-skin-white border-skin-red-500 red-gradient": status === ORDER_STATUS.CANCEL,
            "bg-skin-white border-skin-yellow-500 yellow-gradient": status === ORDER_STATUS.RETURN_REQUESTED,
            "bg-skin-white border-skin-green-500 green-gradient": status === ORDER_STATUS.RETURN_APPROVED,
            "bg-skin-white border-skin-purple-500 purple-gradient": status === ORDER_STATUS.RETURN_RECEIVED,
            "bg-skin-white border-skin-orange-500 orange-gradient": status === ORDER_STATUS.REFUNDED,
        }
    );

    return (
        <div className={statusColor}>{status}</div>
    )
}

export default OrderStatusBadge
