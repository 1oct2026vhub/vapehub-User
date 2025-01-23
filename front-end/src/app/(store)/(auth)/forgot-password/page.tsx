"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { NextPage } from "next";
import { ReactElement } from "react";

const ForgotPassword: NextPage = (): ReactElement => {
    return (
        <>
            <Header />
            <main className="auth-form-container">
                <div className="auth-form-wrapper !max-w-[674px]">
                    <div className="space-y-2">
                        <h1 className="text-22 md:text-h4 font-bold primary-gradient-600">Forgot Password</h1>
                        <p className="text-content-2 md:text-content-1 text-skin-neutral-300 font-bold">Enter your email and we will send a link to reset your password</p>
                    </div>
                    <form className="flex flex-col gap-6 md:gap-8 w-full">
                        <div className="flex w-full justify-center items-center">
                            <InputField
                                type="email"
                                label="Email"
                                isRequired
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Button
                                size="lg"
                                radius="sm"
                                color="primary"
                                className="btn primary-btn shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                            >
                                Login
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

export default ForgotPassword;