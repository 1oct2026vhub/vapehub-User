"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { EyeOpenIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { NextPage } from "next";
import { ReactElement } from "react";

const ResetPassword: NextPage = (): ReactElement => {
    return (
        <>
            <Header />
            <main className="py-8 md:py-17.5 px-4 md:px-12.5 flex items-center justify-center">
                <div className="auth-form-wrapper !max-w-[674px]">
                    <div className="space-y-2">
                        <h1 className="text-22 md:text-h4 font-bold primary-gradient-600">Choose a New Password</h1>
                        <p className="text-content-2 md:text-content-1 text-skin-neutral-300 font-bold">Your new password must be different from your previous one.</p>
                    </div>
                    <form className="flex flex-col gap-6 md:gap-8 w-full">
                        <div className="flex w-full justify-center items-center">
                            <InputField
                                type="password"
                                label="New Password"
                                isRequired
                                className="w-full"
                                endContent={
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        startContent={<EyeOpenIcon className="z-10" />}
                                        className="!p-0 h-fit hover:!bg-transparent"
                                    />
                                }
                            />
                        </div>
                        <div className="flex w-full justify-center items-center">
                            <InputField
                                type="password"
                                label="Confirm Password"
                                isRequired
                                className="w-full"
                                endContent={
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        startContent={<EyeOpenIcon className="z-10" />}
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
                                className="btn primary-btn shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                            >
                                Reset Password
                            </Button>
                            <Button
                                size="lg"
                                radius="sm"
                                color="primary"
                                variant="light"
                                className="btn primary-gradient-100 hover:shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                </div >
            </main >
            <Footer />
        </>
    );
};

export default ResetPassword;