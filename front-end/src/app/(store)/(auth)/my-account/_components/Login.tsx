"use client";
import { FunctionComponent, ReactElement, useEffect, useState } from "react"
import { EyeClosedIcon, EyeOpenIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { SIGN_IN_FORM_CONFIG, SIGN_IN_SCHEMA, SignInFormSchema } from "@/lib/config/login.config";
import { Form } from "@/components/ui/Form";
import { signIn } from "next-auth/react";
import { toast } from 'sonner';
import { ROUTES } from "@/lib/routes";
import { useRememberMe } from "@/lib/hooks/useRememberMe";

const Login: FunctionComponent = (): ReactElement => {
    const [rememberMeValue, setRememberMe] = useState(false);
    const { rememberMe, forgetMe, getRememberedCredentials } = useRememberMe()
    const [pwdVisibility, setPwdVisibility] = useState(false);
    const rememberRef = getRememberedCredentials();
    const searchParams = new URLSearchParams(window.location.search);

    const callbackUrl = searchParams.get('callbackUrl') || '/my-account';

    const signInFromConfig = useForm<SignInFormSchema>({
        resolver: zodResolver(SIGN_IN_SCHEMA),
        mode: 'onBlur',
    });

    const handleFormSubmit = async ({ email, password }: SignInFormSchema) => {

        const response = await signIn('credentials', {
            email,
            password,
            rememberMeValue,
            redirect: false,
            callbackUrl
        });
 
        if (!response || response?.error) {
            return toast.error(response?.error ?? 'Error while trying to login, please try again');
        }
        
        if (rememberMeValue) {
            rememberMe(email, password);
        } else {
            forgetMe();
        }
    }


    useEffect(() => {
        
        if (!rememberRef) return;
        signInFromConfig.reset({
            email: rememberRef?.email,
            password: rememberRef?.password,
        });
        setRememberMe(true)

    }, []);


    return (
        <Form {...signInFromConfig}>
            <form
                onSubmit={signInFromConfig.handleSubmit(handleFormSubmit)}
                noValidate 
                autoComplete="off"
                className="flex flex-col gap-6 md:gap-8 w-full">
                <div className="flex flex-col gap-4.5 md:gap-5 w-full">
                    <div className="flex w-full justify-center items-center">
                        <InputField control={signInFromConfig.control}
                            name="email"
                            type={SIGN_IN_FORM_CONFIG.EMAIL.TYPE}
                            label={SIGN_IN_FORM_CONFIG.EMAIL.LABEL} 
                            disableAutocomplete
                            isRequired />
                    </div>
                    <div className="flex w-full justify-center items-center">
                        <InputField
                            control={signInFromConfig.control}
                            isRequired
                            type={pwdVisibility ? "text" : SIGN_IN_FORM_CONFIG.PASSWORD.TYPE}
                            label={SIGN_IN_FORM_CONFIG.PASSWORD.LABEL}
                            name="password"
                            disableAutocomplete
                            endContent={
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    type="button"
                                    onPress={() => setPwdVisibility(prev => !prev)} startContent={pwdVisibility ? <EyeOpenIcon className="z-10 mb-1" /> : <EyeClosedIcon className="z-10 mb-1" />}
                                    className="!p-0 h-fit hover:!bg-transparent"
                                />
                            }
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <Checkbox
                            classNames={{
                                base: "w-fit pr-0",
                                wrapper: "after:bg-primary-gradient-100",
                                label: "!text-content-3 md:!text-content-1 text-skin-neutral-300 font-semibold",
                            }}
                             isSelected={rememberMeValue}
                            onValueChange={setRememberMe} 
                        >Remember me</Checkbox>
                        <Link href={ROUTES.FORGOT} className="primary-gradient-100 text-content-1 font-bold tracking-tight font-oswald">Forgot Password?</Link>
                    </div>
                </div>
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className="btn primary-btn shadow-input text-title-1 md:text-2xl w-full h-12 !rounded-md uppercase"
                    disabled={signInFromConfig.formState.isSubmitting}
                    isLoading={signInFromConfig.formState.isSubmitting}
                    type="submit"
                >
                    Login
                </Button>
            </form>
        </Form>
    )
}

export default Login;