import { cn } from "@/lib/utils";
import { ORDER } from "@/lib/config/order.config";
import NoImage from "@/components/NoImage";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/config/app.config";
import Link from "next/link";

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
    const statusColor = cn(
        "p-1.5 md:p-2 w-fit capitalize rounded-md md:rounded-lg border !text-content-3 md:!text-content-1 font-bold",
        {
            "bg-skin-white border-skin-neutral":status === "pending",
            "bg-skin-white border-skin-blue-500 blue-gradient": status === "Order Confirmed",
            "bg-skin-primary-50 border-skin-primary2-500 text-skin-primary2-500": status === "Delivered",
        }
    );

    return (
        <Link href={`/${data.variant?.slug}`} className="bg-white rounded-14 shadow-card p-2 md:p-4 flex items-stretch gap-3 md:gap-7">

            <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
                <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow h-full flex flex-col justify-center">

                    <NoImage
                        src={data.variant?.variantImages?.[0]?.image_url || ""}
                        alt={data.product.name}
                        width={104}
                        height={100}
                    />
                </div>
            </div>

            <div className="flex items-start gap-6 justify-between w-full">
                <div className="flex flex-col gap-4">
                    {/* Status Badge */}
                    <div className={statusColor}>{status}</div>

                    {/* Order Title */}
                    <h2 className="text-content-2 sm:text-content-1 lg:text-title-1 text-skin-neutral-400 font-semibold">
                        {data.product.name}
                    </h2>

                    {/* Order ID */}
                    <div>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Quantity : {data.quantity}</p>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Flavour : {data.variant?.slug}</p>
                    </div>
                </div>
                <div className="space-y-2 text-right">
                    <p className="text-skin-neutral-500 text-content-1 sm:text-title-2 lg:text-h5 font-bold">{DEFAULT_CURRENCY_SYMBOL}{Number(data.quantity) * Number(data.variant?.price || 0)}</p>
                    {isCouponApplied && <p className="primary-gradient-100 text-content-3 sm:text-content-1 lg:text-title-1 font-bold text-nowrap">Coupon Applied</p>}
                </div>
            </div>
        </Link>
    );
};

export default OrderDetailCard;
