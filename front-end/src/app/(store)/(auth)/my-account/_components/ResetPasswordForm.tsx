'use client';

import { FunctionComponent, ReactElement, useState } from "react"
import { Button } from "@nextui-org/button";
import { CHANGE_PASSWORD_FORM_CONFIG, CHANGE_PASSWORD_SCHEMA, ChangePasswordFormSchema } from "@/lib/config/reset-password.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { ServerActionStatus } from "@/lib/config/app.config";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/Form";
import InputField from "@/components/InputField";
import { EyeClosedIcon, EyeOpenIcon } from "@/components/Icons";
import { resetPasswordAction } from "@/lib/server.actions";
import Link from "next/link";

interface Props {
    token: string;
}
const ResetPasswordForm: FunctionComponent<Props> = ({
    token
}): ReactElement => {

    const changePasswordFormConfig = useForm<ChangePasswordFormSchema>({
        mode: 'all',
        resolver: zodResolver(CHANGE_PASSWORD_SCHEMA),
    });
    const router = useRouter();
    const [pwdVisibility, setPwdVisibility] = useState(false);
    const [cPwdVisibility, setCPwdVisibility] = useState(false);

    const handleFormSubmit = async ({
        password,
    }: ChangePasswordFormSchema) => {
        const response = await resetPasswordAction(token, password);

        if (response.status === ServerActionStatus.ERROR) {
            return toast.error(response.message);
        }
        toast.success(response.data?.message);
        router.replace(ROUTES.MY_ACCOUNT);
    };
    return (
        <div className="auth-form-container">
            <div className="auth-form-wrapper !max-w-[674px]">
                <div className="space-y-2">
                    <h1 className="text-22 md:text-h4 font-bold primary-gradient-600">Choose a New Password</h1>
                    <p className="text-content-2 md:text-content-1 text-skin-neutral-300 font-bold">Your new password must be different from your previous one.</p>
                </div>
                <Form {...changePasswordFormConfig}>
                    <form onSubmit={changePasswordFormConfig.handleSubmit(handleFormSubmit)}
                        noValidate
                        className="flex flex-col space-y-6 md:space-y-8 w-full">
                        <div className="flex w-full flex-col justify-center items-start">
                            <InputField
                                control={changePasswordFormConfig.control}
                                isRequired
                                name="password"
                                type={pwdVisibility ? "text" : CHANGE_PASSWORD_FORM_CONFIG.NEW_PASSWORD.TYPE}
                                label={CHANGE_PASSWORD_FORM_CONFIG.NEW_PASSWORD.LABEL}
                                className="w-full"
                                showStatus={true}
                                endContent={
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        type="button"
                                        onPress={() => setPwdVisibility(prev => !prev)}
                                        startContent={pwdVisibility ? <EyeOpenIcon className="z-10" /> : <EyeClosedIcon className="z-10" />}
                                        className="!p-0 h-fit hover:!bg-transparent"
                                    />
                                }
                            />

                        </div>
                        <div className="flex w-full justify-center items-center">
                            <InputField
                                control={changePasswordFormConfig.control}
                                isRequired
                                name="confirmNewPassword"
                                type={cPwdVisibility ? "text" : CHANGE_PASSWORD_FORM_CONFIG.CHANGE_PASSWORD.TYPE}
                                label={CHANGE_PASSWORD_FORM_CONFIG.CHANGE_PASSWORD.LABEL}
                                className="w-full"
                                endContent={
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        type="button"
                                        onPress={() => setCPwdVisibility(prev => !prev)}
                                        startContent={cPwdVisibility ? <EyeOpenIcon className="z-10" /> : <EyeClosedIcon className="z-10" />}
                                        className="!p-0 h-fit hover:!bg-transparent"
                                    />
                                }
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Button
                                size="lg"
                                radius="sm"
                                color="primary"
                                type="submit"
                                className="btn primary-btn shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                                disabled={changePasswordFormConfig.formState.isSubmitting}
                                isLoading={changePasswordFormConfig.formState.isSubmitting}
                            >
                                Reset Password
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
    )
}

export default ResetPasswordForm