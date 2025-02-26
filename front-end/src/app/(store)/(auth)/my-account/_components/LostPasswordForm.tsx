
"use client"
import InputField from "@/components/InputField";
import { Form } from "@/components/ui/Form";
import { ServerActionStatus } from "@/lib/config/app.config";
import { RESET_PASSWORD_FORM_CONFIG, RESET_PASSWORD_SCHEMA, ResetPasswordFormSchema } from "@/lib/config/reset-password.config";
import { ROUTES } from "@/lib/routes";
import { forgotPasswordAction } from "@/lib/server.actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FunctionComponent, ReactElement } from "react";
import { useForm } from 'react-hook-form';
import { toast } from "sonner";

const LostPasswordForm: FunctionComponent = (): ReactElement => {

    const router = useRouter();

    const resetPasswordFromConfig = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(RESET_PASSWORD_SCHEMA),
        mode: 'onBlur',
    });

    const handleFormSubmit = async (fieldValue: ResetPasswordFormSchema) => {
        const response = await forgotPasswordAction(fieldValue.email); 
        
        if (response.status === ServerActionStatus.ERROR) {
            return toast.error(response.message);
        } 
        toast.success(response.data?.message); 
        router.replace(ROUTES.MY_ACCOUNT);
        resetPasswordFromConfig.reset();
    };

    return (

        <div className="auth-form-container">
            <div className="auth-form-wrapper !max-w-[674px]">
                <div className="space-y-2">
                    <h1 className="text-22 md:text-h4 font-bold primary-gradient-600">Forgot Password</h1>
                    <p className="text-content-2 md:text-content-1 text-skin-neutral-300 font-bold">Enter your email and we will send a link to reset your password</p>
                </div>
                <Form {...resetPasswordFromConfig}>
                    <form onSubmit={resetPasswordFromConfig.handleSubmit(handleFormSubmit)}
                        noValidate
                        className="flex flex-col space-y-6 md:space-y-8 w-full">
                        <div className="flex w-full justify-center items-center">

                            <InputField
                                control={resetPasswordFromConfig.control}
                                name="email"
                                type={RESET_PASSWORD_FORM_CONFIG.EMAIL.TYPE}
                                label={RESET_PASSWORD_FORM_CONFIG.EMAIL.LABEL}
                                isRequired />

                        </div>
                        <div className="space-y-2.5">
                            <Button
                                size="lg"
                                radius="sm"
                                color="primary"
                                type="submit"
                                className="btn primary-btn shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                                isLoading={resetPasswordFromConfig.formState.isSubmitting}
                                disabled={resetPasswordFromConfig.formState.isSubmitting}
                            >
                                Send Reset Link
                            </Button>
                             
                                <Button 
                                    as={Link}
                                    href={ROUTES.MY_ACCOUNT}
                                    size="lg"
                                    radius="sm"
                                    color="primary"
                                    variant="light"
                                    type="button" 
                                    className="btn primary-gradient-100 hover:shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                                >
                                    Back
                                </Button> 
                        </div>
                    </form>
                </Form>
            </div >
        </div >

    );
};

export default LostPasswordForm;