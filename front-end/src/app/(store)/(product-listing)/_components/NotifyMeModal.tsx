"use client";

import { BellIcon, CloseIcon } from '@/components/Icons';
import { Form } from '@/components/ui/Form';
import { ServerActionStatus } from '@/lib/config/app.config';
import {
    NOTIFY_ME_FORM_CONFIG,
    NOTIFY_ME_SCHEMA,
    NotifyMeFormSchema,
} from '@/lib/config/notify.config';
import { notifyMeWhenAvailable } from '@/lib/server.actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button';
import { Checkbox, Input, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { FunctionComponent, ReactElement, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface NotifyMeModalProps {
    productId: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const NotifyMeModal: FunctionComponent<NotifyMeModalProps> = ({
    productId,
    isOpen,
    onOpenChange,
}): ReactElement => {
    const notifyForm = useForm<NotifyMeFormSchema>({
        resolver: zodResolver(NOTIFY_ME_SCHEMA),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            marketing_opt_in: false,
        },
    });

    useEffect(() => {
        if (!isOpen) {
            notifyForm.reset({
                email: '',
                marketing_opt_in: false,
            });
        }
    }, [isOpen, notifyForm]);

    const handleFormSubmit = async ({ email, marketing_opt_in }: NotifyMeFormSchema) => {
        const response = await notifyMeWhenAvailable(productId, {
            email,
            marketing_opt_in: marketing_opt_in ?? false,
        });

        if (response.status === ServerActionStatus.ERROR) {
            toast.error(response.message);
            return;
        }

        const message = response.data.already_subscribed
            ? "You're already signed up for this product."
            : "You're signed up. We'll email you once when this product is in stock.";

        toast.success(message);
        notifyForm.reset({ email: '', marketing_opt_in: false });
        onOpenChange(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="center"
            hideCloseButton
            classNames={{
                base: 'mx-4 max-w-[480px]',
                backdrop: 'bg-black/50',
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <div className="flex justify-end px-4 pt-4">
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={onClose}
                                className="text-skin-neutral-400 hover:text-skin-neutral-600 transition-colors"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <ModalBody className="px-6 pb-8 pt-0 space-y-5">
                            <div className="space-y-2 text-center">
                                <h2 className="text-h4 md:text-h3 font-oswald font-bold uppercase text-skin-neutral-700">
                                    Get this product first!
                                </h2>
                                <p className="text-content-2 text-skin-neutral-500">
                                    Register your email address below to receive an email as soon as this becomes available.
                                </p>
                            </div>

                            <Form {...notifyForm}>
                                <form
                                    className="space-y-4"
                                    onSubmit={notifyForm.handleSubmit(handleFormSubmit)}
                                    noValidate
                                >
                                    <Controller
                                        name="email"
                                        control={notifyForm.control}
                                        render={({ field, fieldState: { error } }) => (
                                            <div className="space-y-1">
                                                <label
                                                    htmlFor="notify-me-email"
                                                    className="block text-content-2 font-bold uppercase text-skin-neutral-400"
                                                >
                                                    {NOTIFY_ME_FORM_CONFIG.EMAIL.LABEL}
                                                    <span className="text-skin-red-400"> *</span>
                                                </label>
                                                <Input
                                                    {...field}
                                                    id="notify-me-email"
                                                    type={NOTIFY_ME_FORM_CONFIG.EMAIL.TYPE}
                                                    placeholder={NOTIFY_ME_FORM_CONFIG.EMAIL.PH}
                                                    isInvalid={!!error}
                                                    errorMessage={error?.message}
                                                    classNames={{
                                                        input: '!bg-skin-white !text-skin-neutral-400 font-normal !text-title-2 placeholder:!text-skin-neutral-400 placeholder:!font-normal truncate',
                                                        innerWrapper: '!bg-skin-white gap-2 hover:!bg-skin-white',
                                                        inputWrapper:
                                                            'pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="marketing_opt_in"
                                        control={notifyForm.control}
                                        render={({ field: { value, onChange } }) => (
                                            <Checkbox
                                                isSelected={value}
                                                onValueChange={onChange}
                                                classNames={{
                                                    label: 'text-content-2 text-skin-neutral-500',
                                                }}
                                            >
                                                I want to receive updates about products and promotions. (Optional)
                                            </Checkbox>
                                        )}
                                    />

                                    <Button
                                        size="lg"
                                        radius="md"
                                        color="primary"
                                        type="submit"
                                        disabled={notifyForm.formState.isSubmitting}
                                        isLoading={notifyForm.formState.isSubmitting}
                                        className="btn primary-btn w-full shadow-input !rounded-md uppercase font-oswald !text-title-2 md:!text-h5 !leading-none !font-semibold h-12 gap-2"
                                    >
                                        <BellIcon className="w-5 h-5 shrink-0" />
                                        Email me when available
                                    </Button>
                                </form>
                            </Form>

                            <p className="text-content-3 text-skin-neutral-400 text-center">
                                You&apos;ll receive a one time email when this product arrives in stock. We won&apos;t share your address with anyone else.
                            </p>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default NotifyMeModal;
