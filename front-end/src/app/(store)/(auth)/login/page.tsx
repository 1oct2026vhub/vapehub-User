"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { EyeOpenIcon } from "@/components/Icons";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/react";
import { NextPage } from "next";
import Link from "next/link";
import { ReactElement } from "react";

const Login: NextPage = (): ReactElement => {
    return (
        <>
            <Header />
            <main className="auth-form-container">
                <div className="auth-form-wrapper">
                    <div className="auth-button-wrapper">
                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            className="btn primary-btn shadow-input text-title-2 md:text-22 max-md:h-10"
                        >
                            Login
                        </Button>
                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            variant="bordered"
                            className="btn primary-outline-btn text-title-2 md:text-22 max-md:h-10"
                        >
                            Register
                        </Button>
                    </div>
                    <form className="flex flex-col gap-6 md:gap-8 w-full">
                        <div className="flex flex-col gap-4.5 md:gap-5">
                            <div className="flex w-full justify-center items-center">
                                <InputField
                                    type="email"
                                    label="Email or Username"
                                    isRequired
                                    className="w-full"
                                />
                            </div>
                            <div className="flex w-full justify-center items-center">
                                <InputField
                                    type="password"
                                    label="Password"
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
                            <div className="flex justify-between items-center">
                                <Checkbox
                                    classNames={{
                                        base: "",
                                        wrapper: "after:bg-primary-gradient-100",
                                        label: "!text-content-3 md:!text-content-1 text-skin-neutral-300 font-semibold",
                                    }}
                                >Remember me</Checkbox>
                                <Link href="#" className="primary-gradient-100 text-content-1 font-semibold tracking-tight">Forgot Password?</Link>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            className="btn primary-btn shadow-input text-title-2 md:text-title-1 w-full h-11 md:h-[60px]"
                        >
                            Login
                        </Button>
                    </form>
                </div >
            </main >
            <Footer />
        </>
    );
};

export default Login;