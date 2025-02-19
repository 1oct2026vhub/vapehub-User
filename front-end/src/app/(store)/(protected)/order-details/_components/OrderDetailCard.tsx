import Image from "next/image";
import { cn } from "@/lib/utils";

interface OrderDetailCardProps {
    status?: string;
    imageSrc?: string;
    title?: string;
}

const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
    status = "Delivered",
    imageSrc = "/images/product-1.png",
    title = "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",

}) => {
    const statusColor = cn(
        "p-1.5 md:p-2 w-fit rounded-md md:rounded-lg border !text-content-3 md:text-content-1 font-bold",
        {
            "bg-skin-white border-skin-blue-500 blue-gradient": status === "Order Confirmed",
            "bg-skin-primary-50 border-skin-primary2-500 text-skin-primary2-500": status === "Delivered",
        }
    );

    return (
        <a href="" className="bg-white rounded-14 shadow-card p-2 md:p-4 flex items-stretch gap-3 md:gap-7">

            <div className="bg-skin-white p-2 rounded-10 shadow-brand-card min-w-16 md:min-w-36">
                <div className="bg-skin-base border border-skin-neutral rounded p-1.5 md:px-2.5 md:py-3.5 shadow h-full flex flex-col justify-center">
                    <Image src={imageSrc} alt={title} width={104} height={100} />
                </div>
            </div>

            <div className="flex items-start gap-6 justify-between w-full">
                <div className="flex flex-col gap-4">
                    {/* Status Badge */}
                    <div className={statusColor}>{status}</div>

                    {/* Order Title */}
                    <h2 className="text-content-2 sm:text-content-1 lg:text-title-1 text-skin-neutral-400 font-semibold">
                        {title}
                    </h2>

                    {/* Order ID */}
                    <div>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Quantity : 2</p>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Flavour : Watermelon</p>
                    </div>
                </div>
                <div className="space-y-2 text-right">
                    <p className="text-skin-neutral-500 text-content-1 sm:text-title-2 lg:text-h5 font-bold">£12.99</p>
                    <p className="primary-gradient-100 text-content-3 sm:text-content-1 lg:text-title-1 font-bold text-nowrap">Coupon Applied</p>
                </div>
            </div>
        </a>
    );
};

export default OrderDetailCard;
