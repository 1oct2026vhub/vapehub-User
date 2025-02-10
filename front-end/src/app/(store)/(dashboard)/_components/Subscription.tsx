"use client"
import InputField from '@/components/InputField'
import { Form } from '@/components/ui/Form';
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button'
import { FunctionComponent, ReactElement } from 'react'
import { useForm } from 'react-hook-form';

const Subscription: FunctionComponent = (): ReactElement => {
    const subscribeFromConfig = useForm<SubscribeFormSchema>({
        resolver: zodResolver(SUBSCRIBE_IN_SCHEMA),
        mode: 'onSubmit',
    });
    const handleFormSubmit = async ({ email }: SubscribeFormSchema) => {
        console.log(email);
        
    }
    return (
        <section className='bg-subscription-banner-mob lg:bg-subscription-banner bg-no-repeat bg-center lg:bg-right-bottom bg-cover shadow-subscription rounded-3xl px-5.5 pt-14 pb-7 md:py-12 md:px-9 mt-5 md:mt-10'>
            <div className='lg:max-w-[50%] space-y-5.5 lg:space-y-10'>
                <h1 className='text-skin-white text-title-2 md:text-h4 font-semibold'>
                    <span className='text-[3.875rem] md:text-[7rem] leading-none'>10%</span><span> off, especially for you</span>
                </h1>
                <p className='text-content-2 md:text-title-1 text-skin-white font-bold'>Sign up to receive your exclusive Vapehub discount, and keep up to date on our latest products & offers!</p>
                <Form {...subscribeFromConfig}>
                    <form className='space-y-7.5 subscription-form'
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
                            variant='bordered'
                            type='submit'
                            disabled={subscribeFromConfig.formState.isSubmitting}
                            isLoading={subscribeFromConfig.formState.isSubmitting}
                            className="btn !rounded-10 bg-skin-neutral-500 !text-skin-white border-skin-white shadow-input text-content-1 md:text-title-2 !px-3.5 !py-2 md:!px-6 md:!py-6"
                        >
                            Save 10%
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}

export default Subscription
