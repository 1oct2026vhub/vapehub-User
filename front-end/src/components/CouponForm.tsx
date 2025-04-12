import { EditIcon2 } from '@/components/Icons'
import { Button } from '@nextui-org/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { APPLY_COUPON_FORM_SCHEMA, APPLY_COUPON_FORM_TYPE, APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { applyCoupon } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import { toast } from 'sonner'
import { useState } from 'react'
import { Form } from './ui/Form'
import InputForm from './InputForm'

interface CouponFormProps {
    onCouponApplied: (discount: {
        value: number;
        isApplied: boolean;
        code: string | null;
        message: string | null;
        discountValue: string;
    }) => void;
    initialCouponCode?: string;
    cartTotal: number;
}

const CouponForm: React.FC<CouponFormProps> = ({ onCouponApplied, initialCouponCode = '', cartTotal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isApplied, setIsApplied] = useState(!!initialCouponCode);

    const form = useForm<APPLY_COUPON_FORM_TYPE>({
        resolver: zodResolver(APPLY_COUPON_FORM_SCHEMA),
        defaultValues: {
            couponCode: initialCouponCode,
            shippingMethodId: 0,
        }
    });

    const handleApplyCoupon = async (data: APPLY_COUPON_FORM_TYPE) => {

        const response = await applyCoupon(data as unknown as APPLY_COUPON_PAYLOAD);
        if (response.status === ServerActionStatus.SUCCESS) {
            setIsApplied(true);
            setIsEditing(false);
            onCouponApplied({
                value: cartTotal - response.data.total,
                isApplied: true,
                code: data.couponCode || null,
                message: response.data.coupon.description,
                discountValue: response.data.coupon.discount_value
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
                discountValue: ''
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
            discountValue: ''
        });
    };

    return (
        <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(handleApplyCoupon)} className='flex items-start gap-3'>
                <InputForm
                    type='text'
                    label="Coupon Code"
                    isRequired
                    className='xl:min-w-[366px]'
                    control={form.control}
                    name='couponCode'
                    isDisabled={isApplied && !isEditing}
                />

                {
                    isApplied ? (

                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            type='button'
                            className="btn shadow-button bg-skin-neutral-500 !text-skin-white !p-4 !w-fit !min-w-fit !rounded-10"
                            startContent={<EditIcon2 />}
                            onPress={() => handleEdit()}
                            isLoading={form.formState.isSubmitting}
                            isDisabled={!isEditing ? false : !form.formState.isValid}
                        >
                            Edit
                        </Button>)
                        :
                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            className="btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !leading-none min-w-[130px] md:!min-w-[166px] !font-medium h-11 md:h-12"
                            isLoading={form.formState.isSubmitting}
                            type='submit'
                            isDisabled={!form.formState.isValid}

                        >
                            Apply Code
                        </Button>
                }
            </form>
        </Form>
    );
};

export default CouponForm; 