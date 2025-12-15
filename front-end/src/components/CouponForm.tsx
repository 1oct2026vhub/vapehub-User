import { EditIcon2 } from '@/components/Icons'
import { Button } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { APPLY_COUPON_FORM_SCHEMA, APPLY_COUPON_FORM_TYPE, APPLY_COUPON_PAYLOAD, APPLY_GUEST_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { applyCoupon, applyGuestCoupon } from '@/lib/server.actions'
import { getCookie } from 'cookies-next'
import { CartItem } from '@/lib/config/cart.config'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { toast } from 'sonner'
import { useEffect, useState, useCallback } from 'react'
import { Form } from './ui/Form'
import InputForm from './InputForm'
import { useCart } from '@/lib/context/CartContext'
import { CouponResponse } from '@/lib/config/order.config'

interface CouponFormProps {
    onCouponApplied: (discount: {
        value: number;
        isApplied: boolean;
        code: string | null;
        message: string | null;
        discountValue: string;
        discount_amount?: number;
        shippingCost?: number;
        subTotal?: number;
        total?: number;
        mailSubscriptionData?: {
            discount_amount: number;
            discount_type: string;
            isDiscountUsed: boolean;
        };
        mailSubscriptionDiscount?: number;
    }) => void;
    initialCouponCode?: string;
    cartTotal: number;
    isGuest?: boolean;
    shippingMethodId?: number;
}

const CouponForm: React.FC<CouponFormProps> = ({ onCouponApplied, initialCouponCode = '', isGuest = false, shippingMethodId = 0}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isApplied, setIsApplied] = useState(!!initialCouponCode);
    // const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { isRemoveCoupon, setIsRemoveCoupon } = useCart();

    const form = useForm<APPLY_COUPON_FORM_TYPE>({
        resolver: zodResolver(APPLY_COUPON_FORM_SCHEMA),
        defaultValues: {
            couponCode: initialCouponCode,
            shippingMethodId: 0,
        }
    });

    const handleApplyCoupon = async (data: APPLY_COUPON_FORM_TYPE) => {
        if (isGuest) {
            // For guest users, get cart items from cookie
            const guestCartCookie = getCookie('guest_cart');
            let guestCartItems: CartItem[] = [];
            
            try {
                if (guestCartCookie) {
                    guestCartItems = JSON.parse(guestCartCookie as string);
                }
            } catch (e) {
                console.error('Error parsing guest cart cookie:', e);
                toast.error('Error loading cart items. Please try again.');
                return;
            }

            // Check if cart is empty
            if (guestCartItems.length === 0) {
                toast.error('Your cart is empty. Please add items to apply a coupon.');
                return;
            }

            // Build cart items array for API
            const cartItemsForApi = guestCartItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
            }));

            const payload: APPLY_GUEST_COUPON_PAYLOAD = {
                couponCode: data.couponCode,
                cartItems: cartItemsForApi,
                shippingMethodId: shippingMethodId || 0,
                loyalty: false
            };

            const response = await applyGuestCoupon(payload);
            console.log('🎫 [CouponForm] Guest User - Apply Coupon API Response:', response);
            console.log('🎫 [CouponForm] Guest User - Response Status:', response.status);
            console.log('🎫 [CouponForm] Guest User - Response Data:', 'data' in response ? response.data : 'No data (error response)');
            if(response.status === 'SUCCESS') {
                toast.success('Coupon Applied Successfully');
            }
            if (response.status === ServerActionStatus.SUCCESS) { 
                // if(!response.data?.referral_value) {
                //     toast.error("Invalid coupon code");
                //     return;
                // }
                setIsApplied(true);
                setIsEditing(false);
                // Use discount_amount directly from API response with NaN safety
                const couponData: CouponResponse = response.data;
                // Parse values - handle both number and string types from API (API sometimes returns strings)
                const apiSubTotalValue = couponData.subTotal as number | string;
                const apiSubTotal = typeof apiSubTotalValue === 'string'
                  ? parseFloat(apiSubTotalValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiSubTotalValue) ? apiSubTotalValue : 0);
                const apiTotalValue = couponData.total as number | string;
                const apiTotal = typeof apiTotalValue === 'string'
                  ? parseFloat(apiTotalValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiTotalValue) ? apiTotalValue : 0);
                const apiShippingCostValue = couponData.shippingCost as number | string;
                const apiShippingCost = typeof apiShippingCostValue === 'string'
                  ? parseFloat(apiShippingCostValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiShippingCostValue) ? apiShippingCostValue : 0);
                const discountAmount: number = (couponData.discount_amount !== undefined && Number.isFinite(couponData.discount_amount))
                    ? couponData.discount_amount 
                    : 0;
                
                const discountValue = Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00';
                // Extract mail subscription discount from API response
                const mailSubscriptionDiscountValue = (couponData.mail_subscription_discount !== undefined && Number.isFinite(couponData.mail_subscription_discount))
                    ? couponData.mail_subscription_discount
                    : undefined;
                onCouponApplied({
                    value: discountAmount,
                    isApplied: true,
                    code: data.couponCode || null,
                    message: couponData.coupon.discount_type === "percentage" ? `Extra ${couponData.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${couponData.coupon.discount_value} off`,
                    discountValue: discountValue,
                    discount_amount: (couponData.discount_amount !== undefined && Number.isFinite(couponData.discount_amount)) ? couponData.discount_amount : undefined,
                    shippingCost: apiShippingCost,
                    subTotal: apiSubTotal,
                    total: apiTotal,
                    mailSubscriptionData: couponData.mail_subscription_data,
                    mailSubscriptionDiscount: mailSubscriptionDiscountValue
                });
            } else {
                toast.error(response.message);
                form.reset({ couponCode: '', shippingMethodId: 0 });
                setIsApplied(false);
                onCouponApplied({
                    value: 0,
                    isApplied: false,
                    code: null,
                    message: null,
                    discountValue: '',
                    mailSubscriptionData: undefined,
                    mailSubscriptionDiscount: undefined
                });
            }
        } else {
            // For authenticated users, use the existing flow
            const payload: APPLY_COUPON_PAYLOAD = {
                ...data,
                shippingMethodId: shippingMethodId || 0
            };
            const response = await applyCoupon(payload);
            console.log('🎫 [CouponForm] Logged-in User - Apply Coupon API Response:', response);
            console.log('🎫 [CouponForm] Logged-in User - Response Status:', response.status);
            console.log('🎫 [CouponForm] Logged-in User - Response Data:', 'data' in response ? response.data : 'No data (error response)');
            if(response.status === 'SUCCESS') {
                toast.success('Coupon Applied Successfully');
            }
            if (response.status === ServerActionStatus.SUCCESS) { 
                // if(!response.data?.referral_value) {
                //     toast.error("Invalid coupon code");
                //     return;
                // }
                setIsApplied(true);
                setIsEditing(false);
                // Use discount_amount directly from API response if available, otherwise calculate with NaN safety
                const couponData: CouponResponse = response.data;
                // Parse values - handle both number and string types from API (API sometimes returns strings)
                const apiSubTotalValue = couponData.subTotal as number | string;
                const apiSubTotal = typeof apiSubTotalValue === 'string'
                  ? parseFloat(apiSubTotalValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiSubTotalValue) ? apiSubTotalValue : 0);
                const apiTotalValue = couponData.total as number | string;
                const apiTotal = typeof apiTotalValue === 'string'
                  ? parseFloat(apiTotalValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiTotalValue) ? apiTotalValue : 0);
                const apiShippingCostValue = couponData.shippingCost as number | string;
                const apiShippingCost = typeof apiShippingCostValue === 'string'
                  ? parseFloat(apiShippingCostValue.replace(/[^\d.-]/g, '')) || 0
                  : (Number.isFinite(apiShippingCostValue) ? apiShippingCostValue : 0);
                
                const discountAmount: number = Number.isFinite(couponData.discount_amount) && couponData.discount_amount !== undefined
                    ? couponData.discount_amount
                    : (Number.isFinite(apiSubTotal) && Number.isFinite(apiTotal) ? (apiSubTotal - apiTotal) : 0);
                
                const discountValue = Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00';
                // Extract mail subscription discount from API response
                const mailSubscriptionDiscountValue = (couponData.mail_subscription_discount !== undefined && Number.isFinite(couponData.mail_subscription_discount))
                    ? couponData.mail_subscription_discount
                    : undefined;
                onCouponApplied({
                    value: discountAmount,
                    isApplied: true,
                    code: data.couponCode || null,
                    message: couponData.coupon.discount_type === "percentage" ? `Extra ${couponData.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${couponData.coupon.discount_value} off`,
                    discountValue: discountValue,
                    discount_amount: Number.isFinite(couponData.discount_amount) && couponData.discount_amount !== undefined ? couponData.discount_amount : undefined,
                    shippingCost: apiShippingCost,
                    subTotal: apiSubTotal,
                    total: apiTotal,
                    mailSubscriptionData: couponData.mail_subscription_data,
                    mailSubscriptionDiscount: mailSubscriptionDiscountValue
                });
            } else {
                toast.error(response.message);
                form.reset({ couponCode: '', shippingMethodId: 0 });
                setIsApplied(false);
                onCouponApplied({
                    value: 0,
                    isApplied: false,
                    code: null,
                    message: null,
                    discountValue: '',
                    mailSubscriptionData: undefined,
                    mailSubscriptionDiscount: undefined
                });
            }
        }
    };

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        setIsApplied(false);
        onCouponApplied({
            value: 0,
            isApplied: false,
            code: null,
            message: null,
            discountValue: '',
            mailSubscriptionData: undefined
        });
    }, [onCouponApplied]);

    useEffect(() => {
        if (isRemoveCoupon) {
            handleEdit();
            form.reset({ couponCode: '', shippingMethodId: 0 });
            setIsRemoveCoupon(false);

        } 
    }, [isRemoveCoupon, handleEdit, form, setIsRemoveCoupon]);

    return (
        <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(handleApplyCoupon)} className='flex items-start gap-3'>
                <div className='flex flex-col w-full'>
                    <InputForm
                        type='text'
                        label="Coupon Code"
                        // isRequired
                        className='xl:min-w-[366px]'
                        control={form.control}
                        name='couponCode'
                        isDisabled={isApplied && !isEditing}
                    />
                    
                </div>

                {
                    isApplied ? (
                        <button                           
                            type='button'
                            className="btn shadow-button bg-skin-neutral-500 !text-skin-white !p-3 !w-fit !min-w-fit !rounded-10"
                            onClick={() => handleEdit()}
                        >
                            <EditIcon2 />
                        </button>)
                        :
                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            className="btn primary-btn shadow-button !text-skin-white !rounded-md uppercase text-content-1 md:text-2xl !leading-none h-11 md:h-12"
                            isLoading={form.formState.isSubmitting}
                            type='submit'
                            isDisabled={!form.formState.isValid}
                        >
                            Apply Code
                        </Button>
                }
            </form>
            {/* {errorMessage && (
                <div className="text-red-600 mt-2 text-sm">{errorMessage}</div>
            )} */}
        </Form>
    );
};

export default CouponForm; 