'use client'
import { NextPage } from "next";
import React, { useEffect, useState } from "react"; 
import { Button } from "@nextui-org/button";
import LogoutButton from "../../_components/LogoutButton";
import { ChangeUserPasswordFormData, changeUserPasswordSchema } from "@/lib/config/user.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changeUserPassword } from "@/lib/server.actions";
import { Form } from "@/components/ui/Form";
import { EyeClosedIcon, EyeOpenIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Spinner } from "@nextui-org/react";
import { Input } from "@nextui-org/react";

const AccountSecurity: NextPage = () => {
    const [showButtons, setShowButtons] = useState(false);
    const [currentPwdVisibility, setCurrentPwdVisibility] = useState(false);
    const [newPwdVisibility, setNewPwdVisibility] = useState(false);
    const [confirmPwdVisibility, setConfirmPwdVisibility] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const { fetchProfile, isLoading } = useUserProfile();

    const loadProfile = async () => {
        const result = await fetchProfile(); 
        if (result) {
            setEmail(result.email);
        }
    }
    useEffect(() => {
        loadProfile();
    }, []);

    const form = useForm<ChangeUserPasswordFormData>({
        resolver: zodResolver(changeUserPasswordSchema),
        mode: 'all',
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (data: ChangeUserPasswordFormData) => {
        setIsSubmitting(true);
        try {
            const response = await changeUserPassword({
                email, // This will be filled by the backend from the session
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
             
            if (response.status === ServerActionStatus.SUCCESS) {
                toast.success(response.data?.message || "Password updated successfully");
                form.reset();
                setShowButtons(false);
            } else {
                toast.error(response?.message || "Failed to update password");
            }
        } catch (err) {
            console.error("Password change error:", err);
            toast.error("An error occurred while updating your password");
        } finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <Spinner />
        </div>
    }

    return (
        <main>
            <div className="p-4 bg-skin-white rounded-md md:rounded-lg shadow-card space-y-6 w-full h-full md:min-h-[670px] border border-skin-neutral-50">
                <div className="flex items-start flex-col gap-4.5">
                    <h2 className="text-title-2 md:text-xl text-skin-neutral-400 font-semibold">
                        User ID
                    </h2>
                    <Input
                        type='email'
                        placeholder='dummy@email.com'
                        value={email}
                        isDisabled
                        className='!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1'
                    />
                </div>
                <div className="flex items-start flex-col gap-4.5">
                    <div className='flex items-center gap-4'>
                        <h3 className="text-title-2 md:text-xl text-skin-neutral-400 font-semibold leading-none">Password</h3>
                        {!showButtons && (
                            <button
                                onClick={() => setShowButtons(true)}
                                className="primary-gradient-100 text-content-1 font-semibold hover:border-b border-skin-primary-500 cursor-pointer"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    
                    {showButtons && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4 w-full md:max-w-[50%]">
                                <InputField
                                    control={form.control}
                                    name="currentPassword"
                                    type={currentPwdVisibility ? "text" : "password"}
                                    label="Current Password"
                                    isRequired
                                    className="w-full"
                                    endContent={
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            type="button"
                                            onPress={() => setCurrentPwdVisibility(prev => !prev)}
                                            startContent={currentPwdVisibility ? <EyeOpenIcon className="z-10" /> : <EyeClosedIcon className="z-10" />}
                                            className="!p-0 h-fit hover:!bg-transparent"
                                        />
                                    }
                                />
                                
                                <InputField
                                    control={form.control}
                                    name="newPassword"
                                    type={newPwdVisibility ? "text" : "password"}
                                    label="New Password"
                                    isRequired
                                    className="w-full"
                                    showStatus={true}
                                    endContent={
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            type="button"
                                            onPress={() => setNewPwdVisibility(prev => !prev)}
                                            startContent={newPwdVisibility ? <EyeOpenIcon className="z-10" /> : <EyeClosedIcon className="z-10" />}
                                            className="!p-0 h-fit hover:!bg-transparent"
                                        />
                                    }
                                />
                                
                                <InputField
                                    control={form.control}
                                    name="confirmPassword"
                                    type={confirmPwdVisibility ? "text" : "password"}
                                    label="Confirm Password"
                                    isRequired
                                    className="w-full"
                                    endContent={
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            type="button"
                                            onPress={() => setConfirmPwdVisibility(prev => !prev)}
                                            startContent={confirmPwdVisibility ? <EyeOpenIcon className="z-10" /> : <EyeClosedIcon className="z-10" />}
                                            className="!p-0 h-fit hover:!bg-transparent"
                                        />
                                    }
                                />
                                
                                <div className="flex items-center gap-4.5 pt-6">
                                    <Button
                                        type="button"
                                        size="lg"
                                        radius="md"
                                        color="primary"
                                        className="btn text-content-1 max-md:h-10 rounded-10 primary-outline-btn !font-extrabold"
                                        onPress={() => setShowButtons(false)}
                                        isDisabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        radius="md"
                                        color="primary"
                                        className="btn text-content-1 max-md:h-10 rounded-10 primary-btn !font-extrabold"
                                        isLoading={isSubmitting}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
            <div className="flex md:hidden bg-skin-white p-4 rounded-14 shadow-card w-full mt-4">
                <LogoutButton className="mt-auto red-gradient-100 px-4 py-3 text-content-1 bg-skin-white font-semibold w-full rounded-lg" />
            </div>
        </main>
    );
};

export default AccountSecurity;
