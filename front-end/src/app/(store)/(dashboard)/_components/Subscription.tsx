"use client"
import InputField from '@/components/InputField'
import { Form } from '@/components/ui/Form';
import { ServerActionStatus } from '@/lib/config/app.config';
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { subscribeMail } from '@/lib/server.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button'
import { FunctionComponent, ReactElement, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import { useSubscription } from '@/lib/context/SubscriptionContext';

interface SubscriptionProps {
    className?: string;
}

const Subscription: FunctionComponent<SubscriptionProps> = ({ className }): ReactElement => {
    const [discountAmount, setDiscountAmount] = useState('10');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const { subscriptionSettings } = useSubscription();

    useEffect(() => {
        if (subscriptionSettings) {
            const { discount_amount, discount_type } = subscriptionSettings;

            // Validate and set discount type
            const validDiscountType = discount_type === 'fixed' ? 'fixed' : 'percentage';
            setDiscountType(validDiscountType);

            // Round the discount amount to the nearest whole number
            const roundedDiscount = Math.round(parseFloat(discount_amount)).toString();
            setDiscountAmount(roundedDiscount);
        }
    }, [subscriptionSettings]);

    const subscribeFromConfig = useForm<SubscribeFormSchema>({
        resolver: zodResolver(SUBSCRIBE_IN_SCHEMA),
        mode: 'onSubmit',
    });

    const handleFormSubmit = async ({ email }: SubscribeFormSchema) => {
        const response = await subscribeMail(email);
        if (response.status === ServerActionStatus.ERROR) {
            toast.error(response.message);
            return;
        }
        toast.success("You have successfully subscribed");
        subscribeFromConfig.reset({ email: '' });
    }

    // Format discount display based on type
    const formatDiscount = () => {
        if (discountType === 'percentage') {
            return `${discountAmount}%`;
        }
        return `${DEFAULT_CURRENCY_SYMBOL}${discountAmount}`;
    };

    return (
        <section className={`bg-footer-gradient border-b border-skin-primary-300 px-4 py-7.5 md:px-10 ${className}`}>
            <div className='space-y-5 lg:space-y-7.5 flex flex-col items-center'>
                <div className='space-y-2 text-center'>
                    <h3 className='!text-skin-white text-h5 md:text-h1 xl:text-[60px] font-semibold'>
                        <span>{formatDiscount()}</span>
                        <span> off, especially for you</span>
                    </h3>
                    <p className='!text-content-1 md:!text-title-2 !text-skin-white font-semibold max-w-[500px] mx-auto'>
                        Sign up to receive your exclusive Vapehub discount, and keep up to date on our latest products & offers!
                    </p>
                </div>
                <Form {...subscribeFromConfig}>
                    <form className='subscription-form flex items-center gap-4 w-full max-w-[600px]'
                        onSubmit={subscribeFromConfig.handleSubmit(handleFormSubmit)}
                        noValidate >
                        <InputField control={subscribeFromConfig.control}
                            name="email"
                            type={SUBSCRIBE_FORM_CONFIG.EMAIL.TYPE}
                            placeholder={SUBSCRIBE_FORM_CONFIG.EMAIL.PH}
                            isRequired />

                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            type='submit'
                            disabled={subscribeFromConfig.formState.isSubmitting}
                            isLoading={subscribeFromConfig.formState.isSubmitting}
                            className="btn !rounded bg-skin-neutral-500 !text-skin-white shadow-input text-title-2 md:text-h4 font-oswald uppercase w-[100px] md:min-w-[171px]"
                        >
                            Save {formatDiscount()}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}

export default Subscription
