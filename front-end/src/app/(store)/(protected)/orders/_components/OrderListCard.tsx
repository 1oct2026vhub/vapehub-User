import Image from "next/image";
import { cn } from "@/lib/utils";

interface OrderListCardProps {
  status: string;
  imageSrc: string;
  title: string;
  orderId: string;
}

const OrderListCard: React.FC<OrderListCardProps> = ({ status, imageSrc, title, orderId }) => {
  // Define the status color conditionally
  const statusColor = cn(
    "p-1.5 md:p-2 w-fit rounded-md md:rounded-lg border !text-content-3 md:!text-content-1 font-bold",
    {
      "bg-skin-white border-skin-blue-500 blue-gradient": status === "Order Confirmed",
      "bg-skin-primary-50 border-skin-primary2-500 text-skin-primary2-500": status === "Delivered",
    }
  );

  return (
    <a href="" className="bg-white rounded-14 shadow-card hover:shadow-brand-card p-2 md:p-4 flex items-stretch gap-3 md:gap-7">
      {/* Product Image Section */}
      <div className="bg-skin-white p-1 md:p-2 rounded-md md:rounded-10 shadow-brand-card min-w-16 md:min-w-36">
        <div className="bg-skin-base border border-skin-neutral-100 rounded p-1.5 md:px-2.5 md:py-3.5 shadow h-full flex flex-col justify-center">
          <Image src={imageSrc} alt={title} width={104} height={100} />
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-3.5 md:space-y-5 md:max-w-[50%] xl:max-w-[40%]">
        {/* Status Badge */}
        <div className={statusColor}>{status}</div>

        {/* Order Title */}
        <h2 className="text-content-2 sm:text-content-1 lg:text-title-1 text-skin-neutral-400 line-clamp-2 font-semibold">
          {title}
        </h2>

        {/* Order ID */}
        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Order ID: {orderId}</p>
      </div>
    </a>
  );
};

export default OrderListCard;
