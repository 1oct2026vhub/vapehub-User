import { ORDER, ORDER_STATUS } from "@/lib/config/order.config";
import NoImage from "@/components/NoImage";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/config/app.config";
import Link from "next/link";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { buildCartProductUrl, shouldHideOrderLineVariantDetails } from "@/lib/utils/cart-product-url";
import type { CartVariantAttribute } from "@/lib/config/cart.config";
interface OrderDetailCardProps {
    status:string;
    data: ORDER['orderItems'][0];
    isCouponApplied: number | null;
    /** From product API hide_variant_selector — preferred over attribute heuristics. */
    hideVariantDetails?: boolean;
}

const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
    status,
    isCouponApplied,
    data,
    hideVariantDetails: hideVariantDetailsProp,
}) => {
    const attributes = data.variant?.variantAttributes;

    const variantAttributes: CartVariantAttribute[] = (attributes ?? []).map((attr) => ({
        attribute_id: attr.attribute_id,
        term_slug: attr.term.slug,
        // Order API uses the same pivot visibility flag as cart (`is_visible`).
        is_visible_page: attr.is_visible,
        used_in_variation: attr.used_in_variation,
    }));
    const productUrl = buildCartProductUrl({
        product_slug: data.product.slug,
        variantAttributes,
        product_id: data.product.id,
        variant_id: data.variant?.id,
        useParentProductUrl: hideVariantDetailsProp === true,
    });
    const hideVariantDetails =
        hideVariantDetailsProp === true ||
        shouldHideOrderLineVariantDetails({
            hide_variant_selector: (data.product as { hide_variant_selector?: boolean }).hide_variant_selector,
            productId: data.product.id,
            variantId: data.variant?.id,
            attributes: variantAttributes,
        });
    
    return (
        // 10ml?20=up-to-1500-puffs
        <Link href={productUrl} scroll={true} className="bg-white rounded-14 shadow-card p-2 md:p-4 flex items-stretch gap-3 md:gap-7">

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
                    <div className="!font-oswald text-content-2 sm:text-content-1 lg:text-title-1 text-skin-neutral-400 font-semibold">
                        {data.product.name}
                    </div>

                    {/* Order ID */}
                    <div>
                        <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Quantity : {data.quantity}</p>
                        {/* <p className="primary-gradient-100 text-content-3 md:text-content-1 font-bold">Flavour : {data.variant?.slug}</p> */}
                        {
                            !hideVariantDetails &&
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
