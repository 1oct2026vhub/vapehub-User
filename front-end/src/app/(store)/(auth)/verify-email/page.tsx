"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@nextui-org/button";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReactElement } from "react";

const VerifyEmail: NextPage = (): ReactElement => {
    return (
        <>
            <Header />
            <main className="py-8 md:py-40 px-4 md:px-12.5 flex items-center justify-center">
                <div className="auth-form-wrapper !max-w-[600px] !p-5 !gap-5">
                    <div className="space-y-3.5 pb-3.5 border-b border-skin-neutral-100 text-center w-full">
                        <Image
                            src='/images/verify-email.svg'
                            alt="verify-email"
                            width={242}
                            height={203}
                            className="mx-auto"
                        />
                        <h2 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold ">You’re All Set to Blow Clouds!</h2>
                        <p className="text-content-2 md:text-content-1 text-center font-normal text-skin-neutral-300 mx-auto max-w-[406px]">Your email is verified. Get ready to explore and elevate your vaping journey!</p>
                    </div>
                    <Button
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn primary-btn shadow-input text-content-1 !font-medium md:!min-w-28 h-11 mx-auto"
                    >
                        Login Now
                    </Button>
                </div>
            </main >
            <Footer />
        </>
    );
};

export default VerifyEmail;