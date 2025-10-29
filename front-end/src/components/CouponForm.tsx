import { EditIcon2 } from '@/components/Icons'
import { Button } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { APPLY_COUPON_FORM_SCHEMA, APPLY_COUPON_FORM_TYPE, APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { applyCoupon } from '@/lib/server.actions'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Form } from './ui/Form'
import InputForm from './InputForm'
import { useCart } from '@/lib/context/CartContext'

interface CouponFormProps {
    onCouponApplied: (discount: {
        value: number;
        isApplied: boolean;
        code: string | null;
        message: string | null;
        discountValue: string;
        mailSubscriptionData?: {
            discount_amount: number;
            discount_type: string;
            isDiscountUsed: boolean;
        };
    }) => void;
    initialCouponCode?: string;
    cartTotal: number;
}

const CouponForm: React.FC<CouponFormProps> = ({ onCouponApplied, initialCouponCode = '', cartTotal}) => {
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
        const payload: APPLY_COUPON_PAYLOAD = {
            ...data,
            shippingMethodId: 0
        };
        const response = await applyCoupon(payload);
        if(response.status === 'SUCCESS') {
          toast.success('Coupon Applied Successfully');
        }
        // if(response.status === 'ERROR') {
        //     setErrorMessage(response.message);
        // }
        // else {
        //     setErrorMessage(null);
        // }
        if (response.status === ServerActionStatus.SUCCESS) { 
            if(!response.data?.referral_value) {
                toast.error("Invalid coupon code");
                return;
            }
            setIsApplied(true);
            setIsEditing(false);            
            const discountAmount = (cartTotal - response.data.total).toFixed(2);
            onCouponApplied({
                value: cartTotal - response.data.total,
                isApplied: true,
                code: data.couponCode || null,
                message: response.data.coupon.discount_type === "percentage" ? `Extra ${response.data.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${response.data.coupon.discount_value} off`,
                discountValue: (discountAmount).toString(),
                mailSubscriptionData: response.data.mail_subscription_data
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
                mailSubscriptionData: undefined
            });
        }
    };

    const handleEdit = () => {
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
    };

    useEffect(() => {
        if (isRemoveCoupon) {
            handleEdit();
            form.reset({ couponCode: '', shippingMethodId: 0 });
            setIsRemoveCoupon(false);

        } 
    }, [isRemoveCoupon]);

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