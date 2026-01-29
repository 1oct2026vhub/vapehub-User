"use client"
import { FunctionComponent, ReactElement, useState } from "react"
import { EyeClosedIcon, EyeOpenIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/react";
import { SIGN_UP_FORM_CONFIG, SIGN_UP_SCHEMA, SignUpFormSchema } from "@/lib/config/register.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from 'react-hook-form';
import { Form } from "@/components/ui/Form";
import { ServerActionStatus } from "@/lib/config/app.config";
import { signUpAction } from "@/lib/server.actions";
import { toast } from 'sonner';
import { deleteCookie, getCookie } from "cookies-next";

const Register: FunctionComponent = (): ReactElement => {
    const [pwdVisibility, setPwdVisibility] = useState(false);
    const [cPwdVisibility, setCPwdVisibility] = useState(false);
    const referralCode = getCookie('referral_code') as string;
    const signUpFormConfig = useForm<SignUpFormSchema>({
        mode: 'all',
        resolver: zodResolver(SIGN_UP_SCHEMA),
        defaultValues: {
            email: "", 
            phone: "",
            password:"", 
            confirmPassword:"",
            mail_subscription: false
        },
    });
    const handleFormSubmit = async (fieldValue: SignUpFormSchema) => {
        const payload = {
            ...fieldValue, 
            referralCode: referralCode ?? "",
            mail_subscription: fieldValue.mail_subscription || false
        };        
        const response = await signUpAction(payload);          
        if (response.status === ServerActionStatus.SUCCESS) {
            signUpFormConfig.reset({ 
                email: "", 
                phone: "",
                password:"", 
                confirmPassword:"",
                mail_subscription: false
            });
            deleteCookie('referral_code');
            return toast.success(response?.data?.message ?? 'Registration Success'); 
          }
        if (response.status === ServerActionStatus.ERROR) {
            return toast.error(response.message ?? 'Registration failed'); 
          }
    }
 
    return (
        <Form {...signUpFormConfig} >
            <form onSubmit={signUpFormConfig.handleSubmit(handleFormSubmit)}
                noValidate className="flex flex-col gap-6 md:gap-8 w-full">
                <div className="flex flex-col gap-4.5 md:gap-5">
                    <div className="flex w-full justify-center items-center">
                        <InputField
                            control={signUpFormConfig.control}
                            isRequired
                            name="email"
                            type={SIGN_UP_FORM_CONFIG.EMAIL.TYPE}
                            label={SIGN_UP_FORM_CONFIG.EMAIL.LABEL}
                            className="w-full"
                        />
                    </div>
                    <div className="flex w-full justify-center items-center">
                        <InputField
                            control={signUpFormConfig.control}
                            isRequired
                            name="phone"
                            type={SIGN_UP_FORM_CONFIG.PHONE.TYPE}
                            label={SIGN_UP_FORM_CONFIG.PHONE.LABEL}
                            className="w-full"
                        />
                    </div>
                    <div className="flex w-full flex-col justify-center items-start">
                        <InputField
                            control={signUpFormConfig.control}
                            isRequired
                            name="password"
                            type={pwdVisibility ? "text" : SIGN_UP_FORM_CONFIG.PASSWORD.TYPE}
                            label={SIGN_UP_FORM_CONFIG.PASSWORD.LABEL}
                            className="w-full"
                            showStatus={true}
                            endContent={
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    type="button"
                                    onPress={() => setPwdVisibility(prev => !prev)}
                                    startContent={pwdVisibility ? <EyeOpenIcon className="z-10 mb-1" /> : <EyeClosedIcon className="z-10 mb-1" />}
                                    className="!p-0 h-fit hover:!bg-transparent"
                                />
                            }
                        />
                    </div>

                    <div className="flex w-full justify-center items-center">
                        <InputField
                            control={signUpFormConfig.control}
                            isRequired
                            name="confirmPassword" 
                            type={cPwdVisibility ? "text" : SIGN_UP_FORM_CONFIG.CONFIRM_PASSWORD.TYPE}
                            label={SIGN_UP_FORM_CONFIG.CONFIRM_PASSWORD.LABEL}
                            className="w-full"
                            endContent={
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    type="button"
                                    onPress={() => setCPwdVisibility(prev => !prev)}
                                    startContent={cPwdVisibility ? <EyeOpenIcon className="z-10 mb-1" /> : <EyeClosedIcon className="z-10 mb-1" />}
                                    className="!p-0 h-fit hover:!bg-transparent"
                                />
                            }
                        />
                    </div>

                    <div className="text-content-1 md:text-title-2 text-skin-neutral-300 font-semibold md:font-bold">
                        <p>A link to set a new password will be sent to your email address.</p>
                        <p>Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <a href="#" className="hover:underline">privacy policy.</a></p>
                    </div>
                    <div className="flex justify-start items-center">
                        <Controller
                            name="mail_subscription"
                            control={signUpFormConfig.control}
                            render={({ field }) => (
                                <Checkbox
                                    isSelected={field.value}
                                    onValueChange={field.onChange}
                                    classNames={{
                                        base: "",
                                        wrapper: "after:bg-primary-gradient-100",
                                        label: "!text-content-1 text-skin-neutral-300 font-bold",
                                    }}
                                >
                                    I want to receive updates about products and promotions.
                                </Checkbox>
                            )}
                        />
                    </div>
                </div>
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    type="submit"
                    className="btn primary-btn shadow-input text-title-1 md:text-2xl w-full h-12 !rounded-md uppercase"
                    disabled={signUpFormConfig.formState.isSubmitting}
                    isLoading={signUpFormConfig.formState.isSubmitting}
                >
                    Register Now
                </Button>
            </form>
        </Form>
    )
}

export default Register;